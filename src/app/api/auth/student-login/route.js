import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { studentId, password } = await req.json();

    if (!studentId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }
    if (!studentId || studentId.length > 4) {
      return NextResponse.json({ error: "Studentid must be 4 characters" }, { status: 400 });
    }
    if (!password || password.length > 16) {
      return NextResponse.json({ error: "Password must be within 16 characters" }, { status: 400 });
    }

    // Sanitize to prevent XSS/injection
    const dangerousPattern = /<script|javascript:|onerror=|onclick=|<iframe/i;
    if (dangerousPattern.test(studentId) || dangerousPattern.test(password)) {
      return NextResponse.json({ error: "Invalid input detected" }, { status: 400 });
    }
    await connectDB();

    const student = await Student.findOne({ studentId });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student', studentId: student.studentId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: student._id,
        studentId: student.studentId,
        role: 'student',
      },
    });
  } catch (error) {
    console.error('[STUDENT_LOGIN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}