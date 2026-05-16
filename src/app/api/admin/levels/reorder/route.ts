// /api/admin/levels/reorder.ts
import { NextResponse } from 'next/server';
import Level from '@/models/Level';
import { connectDB } from '@/utils/db';
import verifyAdminAuth from "@/lib/verifyAuth";


export async function PATCH(req: Request) {
    try {
        const authRes = await verifyAdminAuth();
        if (authRes instanceof NextResponse) {
            return authRes;
        }
        await connectDB();
        const { ids } = await req.json();
        if (!Array.isArray(ids)) {
            return NextResponse.json({ error: "Invalid order" }, { status: 400 });
        }
        const bulkOps = ids.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: index } },
            },
        }));

        if (bulkOps.length > 0) {
            await Level.bulkWrite(bulkOps);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: 'Failed to reorder levels' }, { status: 500 });
    }
}
