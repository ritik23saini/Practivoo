import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import School from '@/models/School';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';
import verifyAdminAuth from "@/lib/verifyAuth";
import s3 from '@/lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
// GET /api/admin/schools
export async function GET() {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const allschools = await School.find({});
  const schools = await Promise.all(
    allschools.map(async (school) => {
      const teacherCount = await Teacher.countDocuments({ school: school._id });
      const studentCount = await Student.countDocuments({ school: school._id });

      return {
        ...school.toObject(),
        teacherCount,
        studentCount,
      };
    })
  );
  return NextResponse.json({ success: true, data: schools }, { status: 200 });
}

// POST /api/admin/schools
export async function POST(req: NextRequest) {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { name, email, password, phone, address, code, country, startDate, endDate } = await req.json();
  const lowerCaseEmail = email.toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!lowerCaseEmail || !emailRegex.test(lowerCaseEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Length validations
  if (lowerCaseEmail.length > 50) {
    return NextResponse.json({ error: "Email must not exceed 50 characters." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 16) {
    return NextResponse.json({ error: "Password must be between 8 and 16 characters" }, { status: 400 });
  }


  if (!name || !lowerCaseEmail || !password) {
    return NextResponse.json(
      { success: false, message: 'Name, email, and password are required' },
      { status: 400 }
    );
  }
  console.log(new Date(startDate), new Date(endDate))
  const existing = await School.findOne({ email: lowerCaseEmail });
  if (existing) {
    return NextResponse.json(
      { success: false, message: 'School with this email already exists' },
      { status: 409 }
    );
  }
  const school = await School.create({
    name, email: lowerCaseEmail, password, phone, address, code, country,
    startDate: startDate ? new Date(startDate) : Date.now(),
    endDate: endDate ? new Date(endDate) : undefined
  });
  return NextResponse.json({ success: true, data: school }, { status: 201 });
}

// PUT /api/admin/schools
export async function PUT(req: NextRequest) {
  const { id, ...updateData } = await req.json();
  if (!id) {
    return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
  }
  try {
    await connectDB();
    delete updateData.password; // Prevent password update 
    /*  let updatehashedpassword = ""
     if (updateData.password) {
       const salt = await bcrypt.genSalt(10);
       updatehashedpassword = await bcrypt.hash(updateData.password, salt);
       updateData.password = updatehashedpassword
     } */
    const school = await School.findById(id);
    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    if (updateData.image && school.image) {
      try {
        const urlParts = school.image.split('.com/');
        if (urlParts.length >= 2) {
          const key = decodeURIComponent(urlParts[1].split('?')[0]);
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
          }));
          console.log('✅ Deleted old image:', key);
        }
      } catch (s3Err) {
        console.error('❌ S3 delete failed:', s3Err);
        //  Don't fail update on S3 error (orphan ok, retry later)
      }
    }

    const updated = await School.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error("School PUT error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Update failed" },
      { status: 500 }
    );
  }

}

// DELETE /api/admin/schools
export async function DELETE(req: NextRequest) {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }

  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }
    const school = await School.findById(id);
    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }
    if (school.image) {
      try {
        const urlParts = school.image.split('.com/');
        if (urlParts.length >= 2) {
          const key = decodeURIComponent(urlParts[1].split('?')[0]);
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
          }));
          console.log('✅ Deleted old image:', key);
        }
      } catch (s3Err) {
        console.error('❌ S3 delete failed:', s3Err);
        //  Don't fail update on S3 error (orphan ok, retry later)
      }
    }

    const deleted = await School.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'School deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error("School DELETE error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}