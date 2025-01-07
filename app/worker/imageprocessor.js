import uploadQueue from '../app/lib/queue';
import AWS from 'aws-sdk';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

uploadQueue.process(async (job) => {
  const { fileName, fileBuffer } = job.data;
  const buffer = Buffer.from(fileBuffer, 'base64');

  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: 'image/jpeg', // Adjust based on file type
    };

    const uploadResult = await s3.upload(params).promise();

    console.log(`Image uploaded to S3: ${uploadResult.Location}`);

    return { success: true, url: uploadResult.Location };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
});

console.log('Bull queue worker started...');
