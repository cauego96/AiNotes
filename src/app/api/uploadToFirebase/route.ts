import { $notes } from '@/lib/db/schema';
import { NextResponse } from "next/server";
import {eq} from "drizzle-orm"
import { db } from "@/lib/db";
import { uploadFileToFirebase } from '@/lib/firebase';

export async function POST(req: Request) {
    try {
        const {noteId} = await req.json();
        // extract out the dalle imageurl
        // save it to firebase
        const notes = await db.select().from($notes).where(
            eq($notes.id, parseInt(noteId))
        )
        if (!notes[0].imageUrl){
            return new NextResponse('no image url', {status: 400});
        }
        const firebase_url = await uploadFileToFirebase(
            notes[0].imageUrl, 
            notes[0].name
        );
        // update the note with firebase url
        await db
        .update($notes)
        .set({
            imageUrl: firebase_url
        }).where(
            eq($notes.id, parseInt(noteId))
        )
        return new NextResponse("ok", {status:200});
    } catch (error) {
        return new NextResponse("error", {status:500});
    }
}