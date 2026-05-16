import type { NextApiRequest, NextApiResponse } from 'next';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/lib/s3';
import type { Readable } from 'stream';

interface DeleteBody {
  url: string;
}

export const config = {
  api: {
    bodyParser: false,  //  Required for raw body access
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as Readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    console.log(' Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    //  Read raw body first
    const rawBody = await getRawBody(req);
    let body: DeleteBody;

    try {
      body = JSON.parse(rawBody.toString('utf8'));
      console.log('📥 Received body:', body);
    } catch (parseErr) {
      console.error(' JSON parse error:', parseErr);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { url } = body;

    if (!url) {
      console.error(' No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(' Deleting URL:', url);

    // Extract S3 key
    const urlParts = url.split('.com/');
    if (urlParts.length < 2) {
      return res.status(400).json({ error: 'Invalid S3 URL format' });
    }
    const key = decodeURIComponent(urlParts[1].split('?')[0]);
    console.log('📁 Deleting key:', key);

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    });

    const result = await s3.send(command);
    console.log(' S3 Delete Success:', result);

    res.status(200).json({ success: true, deleted: key });
  } catch (error: any) {
    console.error(' S3 Delete Error:', error);
    res.status(500).json({ 
      error: 'Delete failed', 
      details: error.message 
    });
  }
}
