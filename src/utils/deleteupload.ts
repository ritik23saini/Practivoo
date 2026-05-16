import s3 from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";


const deleteuploads = async (mediaUrls: string[]) => {
    await Promise.allSettled(
        mediaUrls.map(async (url) => {
            try {
                const urlParts = url.split('.com/');
                if (urlParts.length >= 2) {
                    const key = decodeURIComponent(urlParts[1].split('?')[0]);

                    await s3.send(new DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Key: key,
                    }));

                    console.log('✅ Deleted:', key);
                    return { success: true, key };
                }
            } catch (err) {
                console.error(`❌ S3 delete failed for ${url}:`, err);
                return { success: false, url };
            }
        })
    );
}

export default deleteuploads;