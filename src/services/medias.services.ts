import { Request } from 'express'
import { getNameFromFullname, getFiles, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { envConfig, isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from '~/services/database.services'
import VideoStatus from '~/models/schemas/VideoStatus.shema'
import { Media } from '~/models/Others'
import { convertPathtoEncodeHls } from '~/utils/app'
import { getUrlPresigned, uploadFileToS3, uploadFileToS3Presigned } from '~/utils/s3'
import mime from 'mime'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { rimrafSync } from 'rimraf'
import { url } from 'inspector'

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    // item = /home/duy/Downloads/12312312/1231231221.mp4
    const idName = getNameFromFullname(item.split('/').pop() as string)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullname(videoPath.split('/').pop() as string)
      await databaseService.videoStatus.updateOne(
        {
          name: idName
        },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        console.log(videoPath, 'video path')
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        // await fsPromise.unlink(videoPath)
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        console.log(files)
        await Promise.all(
          files.map((filepath) => {
            // D:\laragon\www\DuocDEv\khoahoc\nodejs\tweeter\uploads\videos\90db0081-bb2f-4620-8b11-df9a8f0b5a43\v0\fileSequence0.ts
            // chu y duong dan cho nay

            const filename = 'videos-hls/' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '').slice(1)
            // console.log(filename)
            return uploadFileToS3({
              filepath,
              filename,
              contentType: mime.getType(filepath) as string
            })
          })
        )
        console.log(path.resolve(UPLOAD_VIDEO_DIR, idName))
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await databaseService.videoStatus.updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            {
              name: idName
            },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.error('Update video status error', err)
          })
        console.error(`Encode video ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFilename = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)
        await sharp(file.filepath).jpeg().toFile(newPath)
        console.log(newFullFilename)
        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFilename,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newFullFilename}`
        //     : `http://localhost:${process.env.PORT}/static/image/${newFullFilename}`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }

  async SignUrlAccess(key: string) {
    const PresignedUrl = await getUrlPresigned(key)
    console.log(key)
    return PresignedUrl
    // await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
    // return {
    //   url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
    //   type: MediaType.Image
    // }
    // return {
    //   url: isProduction
    //     ? `${process.env.HOST}/static/image/${newFullFilename}`
    //     : `http://localhost:${process.env.PORT}/static/image/${newFullFilename}`,
    //   type: MediaType.Image
    // }
  }

  async uploadImagePresigned(req: Request) {
    const files = await handleUploadImage(req)
    const result = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        console.log(newName)
        const newFullFilename = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const PresignedUrl = await uploadFileToS3Presigned({
          filename: newFullFilename,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        console.log(PresignedUrl)
        return PresignedUrl
        // await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        // return {
        //   url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
        //   type: MediaType.Image
        // }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newFullFilename}`
        //     : `http://localhost:${process.env.PORT}/static/image/${newFullFilename}`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filepath: file.filepath
        })
        fsPromise.unlink(file.filepath)
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/video/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )
    return result
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)

        queue.enqueue(convertPathtoEncodeHls(file.filepath))
        return {
          url: isProduction
            ? `${envConfig.host}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${envConfig.port}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }
  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}

const mediasService = new MediasService()

export default mediasService
