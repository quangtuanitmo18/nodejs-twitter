# Design Twitter Schema using MongoDB

## Some small notes

- Collection names should be plural and in snake_case, e.g., `users`, `refresh_tokens`
- Field names should be in snake_case, e.g., `email_verify_token`, `forgot_password_token`
- `_id` is a field automatically created by MongoDB, no need to add `_id` field. Also, do not try to rename `_id` to `id` or change its mechanism. It will reduce MongoDB's performance.
- Fields `created_at`, `updated_at` should be of type `Date` for easy sorting, searching, and filtering by time.
- The `created_at` field should always be added when creating a new document.
- The `updated_at` field is optional.
- All fields representing document ids should be of type `ObjectId`.
- To know the data types supported by MongoDB, see [here](https://docs.mongodb.com/manual/reference/bson-types/).

## Function analysis

## users

- Users register by entering `name`, `email`, `day_of_birth`, `password`. So `name`, `email`, `day_of_birth`, `password` are required fields besides `_id` which is automatically created by MongoDB.
- After registration, an email with `email_verify_token` will be sent to verify the email (`duthanhduoc.com/verify-email?email_verify_token=123321123`). Each user has only one unique `email_verify_token`, because if the user clicks re-send email, a new `email_verify_token` will be created to replace the old one. So we add the `email_verify_token` field to the `users` schema. This field is of type `string`, if the user verifies the email, we set it to `''`.
- Similarly, for the forgot password function, an email will be sent to reset the password, we use `forgot_password_token` to verify (`duthanhduoc.com/forgot-password?forgot_password_token=123321123`). So we add the `forgot_password_token` field to the `users` schema. This field is of type `string`, if the user resets the password, we set it to `''`.
- There should be a `verify` field to know the user's account status. For example, unverified email, verified, banned, blue tick. So its value should be an enum.
- Users can update the following information in their profile: `bio`, `location`, `website`, `username`, `avatar`, `cover_photo`. So we add these fields to the `users` schema with type `string`. `avatar`, `cover_photo` are simply string URLs. These are optional values, meaning users can still use the system without entering them. But it is also good to set them to `''` if the user does not enter anything for easier management.
- Finally, the `created_at`, `updated_at` fields to know the creation and update time of the user. So we add these two fields to the User schema with type `Date`. These two fields always have values.

```ts
enum UserVerifyStatus {
  Unverified, // unverified email, default = 0
  Verified, // verified email
  Banned // banned
}
interface User {
  _id: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string // jwt or '' if email is verified
  forgot_password_token: string // jwt or '' if password is reset
  verify: UserVerifyStatus
  bio: string // optional
  location: string // optional
  website: string // optional
  username: string // optional
  avatar: string // optional
  cover_photo: string // optional
}
```

## refresh_tokens

The system will use JWT to authenticate users. So every time a user successfully logs in, a JWT access token and a refresh token will be created.

- JWT access token does not need to be stored in the database, as we will make it stateless.
- Refresh token needs to be stored in the database for increased security.
  A user can have many refresh tokens (unlimited), so we cannot store them all in the `users` collection => One-to-many relationship.
  Sometimes we only care about the refresh token without knowing who the user is. So we create a separate collection to store refresh tokens.

```ts
interface RefreshToken {
  _id: ObjectId
  token: string
  created_at: Date
  user_id: ObjectId
}
```

## followers

A user can follow many other users, if we use an array `followings` containing ObjectId in the `users` collection, it will not be optimal. Because it can easily reach the 16MB limit of MongoDB.
Moreover, if we use the `followings` array, it is easy to find who user A is following, but it is difficult to find who is following user A.
So we create a separate collection to store the follow relationships between users.
1 user has many followers, and 1 follower also has many other users following back => Many-to-many relationship.

```ts
interface Follower {
  _id: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at: Date
}
```

## tweets

We will select the main features of a tweet to clone

1. Tweet can contain text, hashtags, mentions, images, videos
2. Tweet can be visible to everyone or Twitter Circle
3. Tweet can specify who can reply (everyone, people we follow, people we mention)

- Tweet will have nested tweets, meaning a tweet can contain child tweets. Using nested objects is not suitable, because it will soon reach the limit. Moreover, querying information of a child tweet is very difficult.
  So we will store the `parent_id` field to know who this tweet belongs to. If `parent_id` is `null`, it is the root tweet.
- If it is a normal tweet, it will have `content` as a string. If it is a retweet, it will not have `content` but only `parent_id`, in this case, `content` can be `''` or `null`, as I analyzed in previous articles, I prefer `''`, it avoids analyzing the `null` case. So `content` can be `string`.
  > If it is '', it will take up more memory than null, but this is negligible compared to the benefits it brings.
- `audience` represents the privacy of the tweet. For example, the tweet can be public for everyone to see or only for a certain group of people. So `visibility` can be `TweetAudience` enum.
- `type` represents the type of tweet. For example, tweet, retweet, quote tweet.
- `hashtag` is an array containing ObjectId of hashtags. Because each tweet can have many hashtags. So `hashtag` can be `ObjectId[]`.
- `mentions` is an array containing ObjectId of mentioned users. Because each tweet can mention many users. So `mentions` can be `ObjectId[]`.
- `medias` is an array containing ObjectId of media. Because each tweet can have a few media. If uploading images, videos cannot be uploaded and vice versa. So `medias` can be `Media[]`.
- Twitter has many metrics to analyze the reach of a tweet. Within the course's limits, we only analyze views.
  Views are divided into 2 types: `guest_views` is the number of views from non-logged-in users and `user_views` is for logged-in users. These two fields will be of type `number`.

```ts
interface Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId // only null for root tweet
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
}
```

```ts
interface Media {
  url: string
  type: MediaType // video, image
}
enum MediaType {
  Image,
  Video
}
enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}
enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
```

## bookmarks

Bookmark tweets, each user has an unlimited number of bookmarks. The `updated_at` field is not needed because if the user unbookmarks, we will delete this document.

```ts
interface Bookmark {
  _id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
}
```

## likes

Similar to `bookmarks`, we have the `likes` collection.

```ts
interface Like {
  _id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
}
```

## hashtags

- Support searching by hashtag.
- Each tweet can have few hashtags.
- Each hashtag has many tweets.
  ❌Should not do as below

```ts
interface Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId // only null for root tweet
  ❌hashtags:string[] // Should not embed like this, because it will make it difficult to search for tweets with this hashtag, as well as duplicate hashtag data
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
}
```

=> Few-to-many relationship

- Store an array of ObjectId `hashtags` in the `tweets` collection.
- Create a separate collection to store `hashtags` and do not store the `tweet_id` array in the `hashtags` collection. Because if storing `tweet_id` in the `hashtags` collection, it will easily reach the 16MB limit of MongoDB. And it is not necessary to store, because when searching for tweets related to a hashtag, we will use the hashtag id to search in the `tweets` collection.

```ts
interface Hashtag {
  _id: ObjectId
  name: string
  created_at: Date
}
```

## Tweet creation flow

Here I will assume a case of creating a tweet with full hashtags, mentions, and media.
A full body will look like this

```ts
interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string // only null for root tweet, otherwise it is the parent tweet_id as a string
  hashtags: string[] // hashtag names as ['javascript', 'reactjs']
  mentions: string[] // user_id[]
  medias: Media[]
}
```

### Validate Tweet body

To validate 100% of tweet cases is very time-consuming, so I will validate the main cases. Of course, it will miss some rare cases, you can add them if you find them.

- `type` must be one of the 4 types `TweetType`
- `audience` must be one of the 2 types `TweetAudience`
- If `type` is retweet, comment, quote tweet, `parent_id` must be the parent tweet_id, if `type` is tweet, `parent_id` must be `null`
- If `type` is retweet, `content` must be `''`. If `type` is comment, quote tweet, tweet and has no `mentions` and `hashtags`, `content` must be a non-empty string.
- `hashtags` must be an array of strings
- `mentions` must be an array of strings as ids
- `medias` must be an array of `Media`

### Schema validation Tweet

```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "title": "tweets object validation",
    "required": [
      "_id",
      "user_id",
      "type",
      "audience",
      "content",
      "parent_id",
      "hashtags",
      "mentions",
      "medias",
      "guest_views",
      "user_views",
      "created_at",
      "updated_at"
    ],
    "properties": {
      "_id": {
        "bsonType": "objectId",
        "description": "'_id' must be a ObjectId and is required"
      },
      "user_id": {
        "bsonType": "objectId",
        "description": "'user_id' must be a ObjectId and is required"
      },
      "type": {
        "bsonType": "int",
        "enum": [0, 1, 2, 3],
        "description": "'type' must be a TweetType and is required"
      },
      "audience": {
        "bsonType": "int",
        "enum": [0, 1],
        "description": "'audience' must be a TweetAudience and is required"
      },
      "content": {
        "bsonType": "string",
        "description": "'content' must be a string and is required"
      },
      "parent_id": {
        "bsonType": ["null", "objectId"],
        "description": "'parent_id' must be a null or ObjectId and is required"
      },
      "hashtags": {
        "bsonType": "array",
        "uniqueItems": true,
        "additionalProperties": false,
        "items": {
          "bsonType": "objectId"
        },
        "description": "'hashtags' must be a array and is required"
      },
      "mentions": {
        "bsonType": "array",
        "uniqueItems": true,
        "additionalProperties": false,
        "items": {
          "bsonType": "objectId"
        },
        "description": "'mentions' must be a array and is required"
      },
      "medias": {
        "bsonType": "array",
        "uniqueItems": true,
        "additionalProperties": false,
        "items": {
          "bsonType": "object",
          "required": ["url", "type"],
          "additionalProperties": false,
          "properties": {
            "type": {
              "enum": [0, 1, 2],
              "description": "'type' is required and can only be one of the given enum values"
            },
            "url": {
              "bsonType": "string",
              "description": "'url' is a required field of type string"
            }
          }
        },
        "description": "'medias' must be a array and is required"
      },
      "guest_views": {
        "bsonType": "int",
        "minimum": 0,
        "description": "'guest_views' must be a ObjectId and is required"
      },
      "user_views": {
        "bsonType": "int",
        "minimum": 0,
        "description": "'user_views' must be a number and is required"
      },
      "created_at": {
        "bsonType": "date",
        "description": "'created_at' must be a date and is required"
      },
      "updated_at": {
        "bsonType": "date",
        "description": "'updated_at' must be a date and is required"
      }
    },
    "additionalProperties": false
  }
}
```
