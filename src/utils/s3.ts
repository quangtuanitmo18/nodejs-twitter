import { S3 } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
config()
const s3 = new S3({
  region: process.env.S3_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
s3.listBuckets({}).then((data: any) => console.log(data))
