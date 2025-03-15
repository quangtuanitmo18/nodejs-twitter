# Error Handling

In Express.js, there are 2 types of handlers

## Request handler

Receives requests from the client and returns responses.

For each request handler, we have 3 parameters: `req`, `res`, `next`.

If you don't use `next`, you don't need to declare it.

```ts
app.get('/users', (req, res, next) => {
  // do something
  res.send('Hello world')
})
```

- Call `next()` to pass the request to the next request handler.
- Call `next(err)` to pass the request to the next error handler.

When an error occurs in a synchronous handler, it will automatically be passed to the error handler.

When an error occurs in an asynchronous handler, you must call `next(err)` to pass it to the error handler.

## Error handler

Receives errors from the request handler and returns responses.

For each error handler, we **must declare all 4 parameters**: `err`, `req`, `res`, `next`.

If you only declare 3 parameters, it will be considered a request handler.

```ts
app.use((err, req, res, next) => {
  if (err) {
    // do something
    res.status(400).send('Error')
  }
})
```

## Recommended flow

All errors should be brought to one place for handling and returning to the user.

We call this the default error handler, and it should be placed at the app level.

## Error format returned to the user

We should standardize the error format returned to the user.

Regular error

```ts
{
  message: string
  error_info?: any
}
```

Validation error (422)

```ts
{
  message: string,
  errors: {
    [field: string]: {
      msg: string
      [key: string]: any
    }
  }
}
```
