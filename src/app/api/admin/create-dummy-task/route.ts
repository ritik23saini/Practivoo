import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import Question from '@/models/Question';
import Category from '@/models/Category';
import Level from '@/models/Level';
import  verifyAdminAuth  from "@/lib/verifyAuth";

export async function GET() {
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();

  try {
    const categoryName = 'General Knowledge';
    const existingCategory = await Category.findOne({ name: categoryName });
    const category =
      existingCategory ||
      (await Category.create({
        name: categoryName,
        subcategories: ['Geography', 'Sound', 'Civics'],
      }));

    const levelCode = 'PRE_A1';
    let level = await Level.findOne({ code: levelCode });
    if (!level) {
      level = await Level.create({
        code: levelCode,
        defaultName: 'Pre A-1',
        createdBy: 'admin',
      });
    }

    const questions = await Question.insertMany([
      {
        heading: 'The capital of India is ______.',
        question: 'Select Only One',
        media: {},
        options: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'],
        correctAnswer: 'Delhi',
        type: 'single',
      },
      {
        heading: 'Which Picture is shown below?',
        question: 'Which Picture is shown below?',
        media: {
          image: '/mountain.jpg',
        },
        options: ['Hill', 'Mountain', 'River', 'WaterFall'],
        correctAnswer: 'Mountain',
        type: 'single',
      },
      {
        heading: 'Identify the sound:',
        question: 'Identify the sound:',
        media: {
          audio: '/cat.mp3',
        },
        options: ['Dog', 'Cat', 'Bird', 'Cow'],
        correctAnswer: 'Cat',
        type: 'single',
      },
    ]);

    // ✅ Extract only the _id fields (already valid ObjectIds)
    const questionIds = questions.map(q => q._id);
    console.log('Question IDs:', questionIds.map(id => id.toString()));


    const task = await Task.create({
      topic: 'XYZ Topic',
      level: level.code,
      category: category.name,
      status: 'Assigned',
      term: 1,
      week: 1,
      questions: questionIds,
    });

    return NextResponse.json({
      message: 'Dummy task, questions, and category created',
      task,
      questionIds,
      category,
    });
  } catch (error) {
    console.error('[DUMMY_DATA_CREATION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create dummy data' }, { status: 500 });
  }
}