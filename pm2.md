# The PM2 Story

## Before starting

I realized that we don't need a third-party library like `minimist` just to get the environment value. We just need to pass `NODE_ENV=production` before the `node index.js` command.

Example:

```json
{
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  }
}
```

And we can get the value of `NODE_ENV` by `process.env.NODE_ENV`.

> If you need more parameters, use `minimist`, but here we only need to specify the environment, so NODE_ENV is enough.

## Introduction to PM2

PM2 helps manage NodeJs processes efficiently and easily by providing features such as:

- Restart the application when it crashes
- Automatically restart the application when the server reboots
- Monitor NodeJs processes

## Install PM2

It is recommended to install globally for convenience

```bash
npm install pm2@latest -g
```

## Using PM2

### Run app with PM2

```bash
pm2 start index.js
```

### Manage processes

```bash
pm2 restart app_name
pm2 stop app_name
pm2 delete app_name
```

Instead of `app_name`, we can pass

- `all` to perform on all processes
- `id` to perform on a specific process id

### Check status, logs, metrics

Display the list of running processes

```bash
pm2 ls
```

Display logs of a process (`log` or `logs` both work)

```bash
pm2 logs app_name
```

To display more lines, add `--lines`

```bash
pm2 logs app_name --lines 200
```

Display metric dashboard

```bash
pm2 monit
```

### Create configuration file

Create the file `ecosystem.config.js` in the root directory of the project

```js
// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'twitter',
      script: 'node dist/index.js',
      env: {
        NODE_ENV: 'development', // For NODE_ENV, you can use process.env.NODE_ENV or process.NODE_ENV, for others, only use process.env.VARIABLE_NAME
        VARIABLE_NAME: 'Value'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

Run app with the configuration file

By default, the command below will use `env` in the configuration file

```bash
pm2 start ecosystem.config.js
```

To use `env_production`, add `--env production`

```bash
pm2 start ecosystem.config.js --env production
```
