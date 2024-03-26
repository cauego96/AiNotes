'use client'
import React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import TipTapMenuBar from './TipTapMenuBar'
import { Button } from './ui/button'
import { useDebounce } from '@/lib/useDebounce'
import { useMutation } from '@tanstack/react-query'
import { NoteType } from '@/lib/db/schema'
import axios from 'axios'
import Text from '@tiptap/extension-text'
import { useCompletion } from 'ai/react'

type Props = {note: NoteType};

const TipTapEditor = ({note}: Props) => {
    const [editorState, setEditorState] = React.useState(
        note.editorState || '<h1>${note.name}</h1>'
    );
    const {complete, completion} = useCompletion({
        api: '/api/completion',
    });
    const saveNote = useMutation({
        mutationFn: async () => {
            const response = await axios.post('/api/saveNote',{
                noteId: note.id,
                editorState
            });
            return response.data;
        }
    });
    const customText  = Text.extend({
        addKeyboardShortcuts() {
            return {
                "Shift-a" : () => {
                    //console.log("Activate AI");
                    //take the last 30 words
                    const prompt = this.editor.getText().split(' ').slice(-30).join(' ');
                    //console.log(prompt);
                    complete(prompt);
                    return true;
                },
            };
        },
    });

    const editor = useEditor({
        autofocus: true,
        extensions: [StarterKit, customText],
        content: editorState,
        onUpdate: ({editor}) => {
            setEditorState(editor.getHTML());
        },
    });

    const lastCompletion = React.useRef("");

    React.useEffect(() => {
        if(!completion || !editor) return;
        const diff = completion.slice(lastCompletion.current.length);
        lastCompletion.current = completion;
        editor.commands.insertContent(diff);
    }, [completion, editor]);

    const debouncedEditorState = useDebounce(editorState, 500);
    React.useEffect(() => {
        // save to db
        if(debouncedEditorState === '') return
        saveNote.mutate(undefined, {
            onSuccess: data => {
                console.log('sucess update!', data)
            },
            onError: err => {
                console.error(err)
            }
        })
        //console.log(debouncedEditorState);
    }, [debouncedEditorState]);

  return (
    <>

    <div className="flex">
        {editor && <TipTapMenuBar editor={editor}/>}
        <Button disabled variant={"outline"}>
            {saveNote.isPending ? "Saving..." : "Saved"}
        </Button>
    </div>
    <div className="prose">
        <EditorContent editor={editor}/>
    </div>
    </>
  );
}

export default TipTapEditor