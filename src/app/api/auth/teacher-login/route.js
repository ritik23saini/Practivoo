import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Teacher from '@/models/Teacher';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Class from '@/models/Class';

export async function POST(req) {
  try {
    const { teacherId, password } = await req.json();

    if (!teacherId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }
    if (!teacherId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }
    if (!teacherId || teacherId.length > 4) {
      return NextResponse.json({ error: "Id must be 4 characters" }, { status: 400 });
    }
    if (!password || password.length > 16) {
      return NextResponse.json({ error: "Password must be within 16 characters" }, { status: 400 });
    }

    // Sanitize to prevent XSS/injection
    const dangerousPattern = /<script|javascript:|onerror=|onclick=|<iframe/i;
    if (dangerousPattern.test(teacherId) || dangerousPattern.test(password)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    await connectDB();

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    const isValid = await bcrypt.compare(password, teacher.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: teacher._id, role: 'teacher', teacherId: teacher.teacherId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const classes = await Class.aggregate([
      { $match: { teachers: teacher._id } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "class",
          as: "students"
        }
      },
      {
        $group: {
          _id: "$level",  // Group by name to get distinct level
          id: { $first: "$_id" },
          level: { $first: "$level" }
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
          level: 1,

        }
      },
      { $sort: { name: 1 } }
    ]);

    return NextResponse.json({
      token,
      user: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        role: 'teacher',
      },
      classTaught: classes
    });
  } catch (error) {
    console.error('[TEACHER_LOGIN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}