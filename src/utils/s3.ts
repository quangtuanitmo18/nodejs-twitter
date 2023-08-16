import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import { config } from 'dotenv'
import path, { resolve } from 'path'
import { error } from 'console'
import { reject } from 'lodash'
config()
const s3 = new S3({
  region: process.env.S3_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET,
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: contentType
    },
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })
  return parallelUploads3.done()
}
export const deleteFileS3 = (key: string) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.S3_BUCKET,
        Key: key
      },
      (err, data) => {
        if (err) {
          // console.log('err', err)
          reject(err)
        }
        // console.log(data)
        resolve(data)
      }
    )
  })
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((res) => {
//   console.log(res)
// })
