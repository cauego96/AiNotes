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

type Props = {note: NoteType};

const TipTapEditor = ({note}: Props) => {
    const [editorState, setEditorState] = React.useState(note.editorState || "");
    const saveNote = useMutation({
        mutationFn: async () => {
            const response = await axios.post('/api/saveNote',{
                noteId: note.id,
                editorState
            });
            return response.data;
        }
    })
    const editor = useEditor({
        autofocus: true,
        extensions: [StarterKit],
        content: editorState,
        onUpdate: ({editor}) => {
            setEditorState(editor.getHTML());
        },
    });

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