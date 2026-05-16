import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import { connectDB } from '@/utils/db';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: 'student' | 'teacher';
    };

    let user;
    if (decoded.role === 'student') {
      user = await Student.findById(decoded.id).select('-password -school').populate('school', 'name image -_id');
    } else if (decoded.role === 'teacher') {
      user = await Teacher.findById(decoded.id).select('-password').populate('school', 'name image -_id');
    } else if (decoded.role === 'teacher') {
    }
    console.log(user)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user, role: decoded.role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}