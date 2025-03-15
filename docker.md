# Docker

## What is Docker?

### Problem?

We have a Node.js server running on version 10 and Ubuntu 18.04. One day, we need to maintain and add features to it, which requires you to run the code locally to test. But your machine is Ubuntu 22 (or MacOS) and does not have that Node version, so it cannot run.

This requires you to install a virtual machine with the project's specifications. After installation, you still need to set up the environment, which is very cumbersome. Popular virtual machine software like VMWare is quite heavy and resource-intensive.

That's just one project, if there are many projects, it will be even more tiring.

### Solution?

Docker was created to simplify the above process.

Docker is a virtualization platform that allows packaging applications into an independent container from the host machine. Docker helps synchronize the environment between servers, making it easy to switch between different environments.

That means you only need to install Docker, no need to install multiple virtual machines.

To run an app, there are two ways:

1. You download the source code, build it into an image, and then run that image as a container.
2. You download the app's image and then run that image as a container.

## Image vs Container

A Docker Image is a software (it can be an app or a system) that is packaged.

A Docker Container is an instance of a Docker Image. One Docker Image can create many Docker Containers.

Imagine we install Chrome to browse the web. To install Chrome, download the packaged file `chrome.exe` and install it. After installation, we get a Chrome shortcut on the desktop. Click on this shortcut to run Chrome and browse the web. At that time, Chrome is running as an instance of `chrome.exe`. To have another instance, we do not need to reinstall but just create a new profile.

So here `chrome.exe` is the Docker Image, the running Chrome profile is the Docker Container, and another profile is another Docker Container.

## Docker commands

### Docker information

```bash
docker version
```

### Show images

```bash
docker image ls
```

### Remove image

```bash
docker image rm HASH
```

### Show running containers (add `-a` to show stopped ones)

```bash
docker container ls
# or this one
docker ps
```

### Stop container

```bash
docker container stop HASH
```

### Remove container

```bash
docker container rm HASH
```

### Build Image from `Dockerfile`. `duoc/nodejs:v2` is the image name, named according to the syntax `USERNAME/IMAGE_NAME:TAG`

```bash
docker build --progress=plain -t duoc/nodejs:v2 -f Dockerfile.dev .
```

If you want to specify a `Dockerfile`, add `-f` and the path to that file.

Sometimes there may be errors due to cache, so add `--no-cache`

```bash
docker build --progress=plain -t dev/twitter:v2 -f Dockerfile.dev .
```

### Create and run container based on image

```bash
docker container run -dp OUTSIDE_PORT:DOCKER_PORT IMAGE_NAME
```

example

```bash
docker container run -dp 4000:4000 dev/twitter:v2
```

If you want to map a folder in the container to a folder outside, add `-v`. This is called a volume.

```bash
docker container run -dp 4000:4000 -v ~/Documents/DuocEdu/NodeJs-Super/Twitter/uploads:/app/uploads dev/twitter:v2
```

### Show container logs

```bash
docker logs -f CONTAINER_HASH
```

### Access the container's terminal

```bash
docker exec -it CONTAINER_HASH sh
```

To exit, type `exit`

### To run commands in `docker-compose.yml`, use the command. Sometimes cache errors occur, so add `--force-recreate --build`

```bash
docker-compose up
```

## Other commands

Stop and remove all running containers

```bash
docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
```

Add auto-restart mode for the container when rebooting the server. If there is already a container, use

```bash
docker update --restart unless-stopped CONTAINER_HASH
```

If there is no container yet, add the option `--restart unless-stopped` to the `docker run` command

```bash
docker run -dp 3000:3000 --name twitter-clone --restart unless-stopped -v ~/twitter-clone/uploads:/app/uploads duthanhduoc/twitter:v4
```
