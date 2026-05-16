// src/app/api/admin/questions/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Question from '@/models/Question';
import Task from '@/models/Task';
import deleteuploads from '@/utils/deleteupload';


interface MatchThePairs {
  key: string;
  value: string;
}
// ----------- DELETE -----------
export async function DELETE(
  req: Request,
  context: any
) {
  try {
    await connectDB();
    const { id } = context.params;


    // 1. Fetch question FIRST
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    console.log('Fetched question for deletion:', question);
    // 2. Check if used
    const taskUsingQuestion = await Task.findOne({ questions: id, status: "Assigned" });
    if (taskUsingQuestion) {
      return NextResponse.json(
        { error: 'Cannot delete: Question is used in task(s).' },
        { status: 400 }
      );
    }

    // 3. Extract media URLs
    const mediaUrls: string[] = [
      question.media?.image,
      question.media?.audio,
      ...(question.matchThePairs?.map((pair: MatchThePairs) => pair.key) || [])
    ].filter(Boolean) as string[];

    console.log('Media URLs to delete:', mediaUrls);

    if (mediaUrls.length > 0) {
      //  PARALLEL BATCH DELETE (10x faster)
      deleteuploads(mediaUrls);
    }
    // 5. Delete 
    await Question.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ----------- PUT (Update) -----------
export async function PUT(
  req: Request,
  context: any
) {
  try {
    const updates = await req.json();
    const { id } = context.params;
    await connectDB();


    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    // old media extraction
    const oldMediaUrls: string[] = [
      existingQuestion.media?.image,
      existingQuestion.media?.audio,
      ...(existingQuestion.matchThePairs?.map((pair: MatchThePairs) => pair.key) || [])
    ].filter(Boolean) as string[];

    //  new media extraction
    const newMediaUrls: string[] = [
      updates.media?.image,
      updates.media?.audio,
      ...(Array.isArray(updates.matchThePairs)
        ? (updates.matchThePairs as MatchThePairs[]).map((pair: MatchThePairs) => pair.key)
        : [])
    ].filter(Boolean) as string[];

    const filesToDelete = oldMediaUrls.filter(oldUrl => !newMediaUrls.includes(oldUrl));

    if (filesToDelete.length > 0) {
      //batch delete all old urls from s3
      deleteuploads(filesToDelete);
    }

    // Prepare update data 
    const updateData = {
      heading: updates.heading || '',
      question: updates.question,
      options: updates.options,
      correctAnswer: updates.correctAnswer,
      explanation: updates.explanation || '',
      additionalMessage: updates.additionalMessage || '',
      media: {
        image: updates.media?.image || '',
        audio: updates.media?.audio || '',
      },
      matchThePairs: updates.matchThePairs || [],
      questiontype: updates.questiontype,
      type: updates.type === 'multi' ? 'multi' : 'single',
    };

    const updated = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question: updated });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ----------- GET (Fetch) -----------
export async function GET(
  _req: Request,
  context: any
) {
  try {
    await connectDB();

    const { id } = context.params;
    const question = await Question.findById(id);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question }, { status: 200 });
  } catch (err) {
    console.error('Error fetching question:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}