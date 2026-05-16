// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/lib/s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = promisify(fs.readFile);

const getMimeType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop();

  const mimeTypes: { [key: string]: string } = {
    // Audio formats
    'm4a': 'audio/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'webm': 'audio/webm',
    'aac': 'audio/aac',
    'flac': 'audio/flac',

    // Image formats
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'File parsing error' });
    }

    const fileField = files.file;
    const file: FormidableFile | undefined = Array.isArray(fileField)
      ? fileField[0]
      : fileField;

    const typeField = fields.type;
    const type: string | undefined = Array.isArray(typeField)
      ? typeField[0]
      : typeField;

    if (!file || !type || !['image', 'audio'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file or type' });
    }
    
    const ext = file.originalFilename?.split('.').pop()?.toLowerCase() || 'bin';
    const allowedAudioFormats = ['m4a', 'mp3', 'wav', 'ogg', 'webm', 'aac', 'flac'];
    const allowedImageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

    if (type === 'audio' && !allowedAudioFormats.includes(ext)) {
      return res.status(400).json({
        error: `Audio format not supported. Allowed: ${allowedAudioFormats.join(', ')}`
      });
    }
    if (type === 'image' && !allowedImageFormats.includes(ext)) {
      return res.status(400).json({
        error: `Image format not supported. Allowed: ${allowedImageFormats.join(', ')}`
      });
    }

    try {
      const fileBuffer = await readFile(file.filepath);
      const key = `media/${type}/${randomUUID()}.${ext}`;
      const contentType = getMimeType(file.originalFilename || '');

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      }
      await s3.send(new PutObjectCommand(uploadParams));

      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return res.status(200).json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}