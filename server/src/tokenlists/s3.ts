import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const datasetBucket = 'llama-tokenlists';
const client = new S3Client();

export function storeJSONString(filename: string, body: string, cache?: number) {
	const command = new PutObjectCommand({
		Bucket: datasetBucket,
		Key: filename,
		Body: body,
		ContentType: 'application/json',
		ACL: 'public-read',
		...(!!cache
			? {
					CacheControl: `max-age=${cache}`
			  }
			: {})
	});
	return client.send(command);
}

export async function getS3(filename: string) {
	const command = new GetObjectCommand({
		Bucket: datasetBucket,
		Key: filename
	});
	const data = await client.send(command);
	return {
		body: await data.Body?.transformToString(),
		lastModified: data.LastModified
	};
}
