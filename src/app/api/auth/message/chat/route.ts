import { NextRequest } from "next/server";
import { Types } from "mongoose";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { connectDB } from "@/utils/db"; // Correct naming
import UserMessage from "@/models/UserMessage";

// Extend default JWT payload to include custom claims
interface JwtPayload extends DefaultJwtPayload {
  id: string;
  role: "teacher" | "student";
  teacherId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export async function GET(req: NextRequest) {
  await connectDB();

  const withId = req.nextUrl.searchParams.get("with");
  if (!withId) {
    return new Response(JSON.stringify({ error: "'with' query param is required" }), {
      status: 400,
    });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let decoded: JwtPayload;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);

    if (
      typeof decodedToken === "object" &&
      decodedToken !== null &&
      "id" in decodedToken &&
      "role" in decodedToken
    ) {
      decoded = decodedToken as JwtPayload;
    } else {
      return new Response(JSON.stringify({ error: "Invalid token structure" }), {
        status: 403,
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 403 });
  }

  const { id: userId, role } = decoded;

  try {
    const senderId = new Types.ObjectId(role === "teacher" ? userId : withId);
    const receiverId = new Types.ObjectId(role === "teacher" ? withId : userId);

    const messages = await UserMessage.find({
      sender: senderId,
      receiver: receiverId,
    })
      .populate("replies.student", "name")
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: error.message ?? error.toString(),
      }),
      { status: 500 }
    );
  }
}