# Basic CI/CD Guide

Basic workflow with CI/CD

Code is pushed from local to Github -> Github action will build the image and push the image to Docker Hub -> Server will pull the image from Docker Hub and run it.

## 1. Register an account on Docker Hub

### Log in to Docker Hub on terminal

```bash
docker login
```

Or log in quickly by

```bash
docker login -u <username> -p <password>
```

### Push image to Docker Hub

For an image with a different name

```bash
docker tag local-image:tagname new-repo:tagname
docker push new-repo:tagname
```

### Pull image to local

```bash
docker pull new-repo:tagname
```

> Images built on each computer will be different. They may not run on other computers.
> Example: An image built on a Macbook M2 using **ARM** chip will not run on an Ubuntu machine using **Intel (or AMD)** chip.

## 2. Docker compose

## 3. Github action

Create the file `.github/workflows/docker-image.yml`

The content is as follows

```yaml
name: Docker Image CI

on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./Twitter
    steps:
      - uses: actions/checkout@v3
      - name: 'Create env file'
        run: echo "${{ secrets.TWITTER_ENV_PRODUCTION }}" > .env.production
      - name: Build the Docker image
        run: docker build --progress=plain -t duthanhduoc/twitter:v4 .
      - name: Log in to Docker Hub
        run: docker login -u ${{ secrets.DOCKERHUB_USERNAME }} -p ${{ secrets.DOCKERHUB_PASSWORD }}
      - name: Push the Docker image
        run: docker push duthanhduoc/twitter:v4
```

To make the image name dynamic, update it a bit as below

```yaml
name: Docker Image CI

on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./Twitter
    steps:
      - uses: actions/checkout@v3
      - name: 'Create env file'
        run: echo "${{ secrets.TWITTER_ENV_PRODUCTION }}" > .env.production
      - name: Build the Docker image
        run: |
          IMAGE_TAG=duthanhduoc/twitter:$(date +%s)
          docker build . --file Dockerfile --tag $IMAGE_TAG
          echo "::set-output name=image_tag::$IMAGE_TAG"
        id: build
      - name: Log in to Docker Hub
        run: docker login -u ${{ secrets.DOCKERHUB_USERNAME }} -p ${{ secrets.DOCKERHUB_PASSWORD }}
      - name: Push Docker image to Docker Hub
        run: docker push ${{ steps.build.outputs.image_tag }}
```

## 4. Setup VPS

### Install Docker on Ubuntu server

[Install Docker on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

Fix errors on Ubuntu server

[Error when typing `docker version`, click here](https://docs.docker.com/engine/install/linux-postinstall/)

### To ssh into the server

```bash
ssh -i ~/.ssh/id_duthanhduoc duoc@207.148.118.147
```
