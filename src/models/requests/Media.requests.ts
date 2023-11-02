import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface SignUrlAccessParams extends ParamsDictionary {
  key: string
}
