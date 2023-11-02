import { Router } from 'express'
import {
  SignUrlAccessController,
  XemImageController,
  uploadImageController,
  uploadImagePresignedController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)
mediasRouter.post(
  '/upload-image-presigned',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImagePresignedController)
)
mediasRouter.get(
  '/sign-url-access/:key',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(SignUrlAccessController)
)

mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)
mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)
mediasRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(videoStatusController)
)

export default mediasRouter
