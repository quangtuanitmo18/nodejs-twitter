import { PutObjectCommand, S3, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import HTTP_STATUS from '~/constants/httpStatus'
import { Response } from 'express'
import { envConfig } from '~/constants/config'

const s3 = new S3({
  region: envConfig.s3Region,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
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
      Bucket: envConfig.s3BucketName,
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

// lấy presigned url để upload
export const uploadFileToS3Presigned = async ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  console.log(filename)
  const params = {
    Bucket: envConfig.s3BucketName,
    Key: `${filename}`
    // ContentType: contentType
    // Expires: 300 //s - 5mins
  }
  // const command = new PutObjectCommand(params)

  const command = new PutObjectCommand(params)
  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 300
  })
  // res.json({ url: signedUrl })
  return signedUrl
}

// đã upload rồi, cái này để lấy url truy cập vào file thôi
export const getUrlPresigned = async (key: string) => {
  const params = {
    Bucket: envConfig.s3BucketName,
    Key: key
    // // Expires: 300, //s - 5mins
    // ContentType: contentType
  }
  const command = new GetObjectCommand(params)

  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 3600
  })
  return signedUrl
}

export const deleteFileS3 = (key: string) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: envConfig.s3BucketName,
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
export const sendFileFromS3 = async (res: Response, filepath: string) => {
  try {
    const data = await s3.getObject({
      Bucket: envConfig.s3BucketName,
      Key: filepath
    })
    ;(data.Body as any).pipe(res)
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send('Not found')
  }
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((res) => {
//   console.log(res)
// })
