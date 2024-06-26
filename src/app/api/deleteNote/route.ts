import { NextResponse } from 'next/server';
import { $notes } from '@/lib/db/schema';
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function POST(req: Request){
    const {noteId} = await req.json();
    await db.delete($notes).where(
        eq($notes.id, parseInt(noteId))
    );
    return new NextResponse('ok', {status: 200});
}