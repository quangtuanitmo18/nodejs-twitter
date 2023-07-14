import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
//middleware
// userRouter.use(
//   (req, res, next) => {
//     console.log('Time: ', Date.now())
//     next()
//   },
//   (req, res, next) => {
//     console.log('Time 2: ', Date.now())
//     next()
//   }
// )
// userRouter.get('/tweets', (req, res) => {
//   res.json({
//     data: [s
//       {
//         id: 1,
//         text: 'hello world'
//       }
//     ]
//   })
// })

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter
