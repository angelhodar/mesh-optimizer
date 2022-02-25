# Mesh Optimizer

![Blender and Docker](./cover.png)

## Introduction

This project contains a Blender-powered docker container pipeline that automatically converts any 3D model (obj, fbx, stl, gltf, etc) to a compressed and optimized single .glb file.
It offers a simple HTTP API to interact with the microservice and also provides some interfaces to upload the resulting file to 3 different storage providers: LocalProvider, S3Provider and UnityProvider.

## Features

- All the power of Blender via Python API
- Supports a wide range of input formats
- Up to 95% model size reduction via optimizations and use of the gltf binary (.glb) format
- Per model parametrization via API
- Several storage providers implemented out of the box

## Getting Started

To run the microservice you need to first install Docker in your system. Once you have installed it, then you can simply pull the image from docker hub:

```sh
docker pull angelhodar/mesh-optimizer@latest
```

Or clone the repo and build the image yourself:

```sh
git clone https://github.com/angelhodar/mesh-optimizer.git
docker build . -t YOUR_IMAGE_NAME
```

Now to run the container you just need to run the following command:

```sh
docker run --env-file PATH_TO_ENV_FILE -p HOST_PORT:CONTAINER_PORT YOUR_IMAGE_NAME
```

The environment variables you can configure are listed in the section below.

> Note: The value of the variable CONTAINER_PORT listed above should be the same as the variable PORT you define in .env file

## Configuration

The container is configurated via environment variables:

- **PORT**: The port used by the container to listen for requests. In some platforms like _Heroku_ or _Render_ this variable is set automatically so you dont need to configure it. The container will listen on port 8000 by default.
- **STORAGE_PROVIDER**: The type of storage that the service will use. Check the _Storage providers_ section for more info.
- **AWS_ACCESS_KEY_ID**: Key id for your aws credentials
- **AWS_SECRET_ACCESS_KEY**: Key secret for your aws credentials
- **AWS_BUCKET_NAME**: The name of the bucket
- **AWS_BUCKET_REGION**: The region where the bucket is hosted
- **UNITY_PROJECT_ID**: The id of your project in the Unity Cloud Services
- **UNITY_API_KEY**: API key of your Unity Cloud Content Delivery project
- **UNITY_BUCKET_ID**: Id of the bucket you want to use

## Pipeline

The whole pipeline consists in 4 steps:

1. Decompress zip file with mesh and textures in a folder inside ./tmp directoy
2. Executes Blender in headless mode passing the mesh path as paramter to python script (_2gltf.py_) which converts to .glb and optionally reduce polygon complexity
3. Pass some gltf transformations and optimizations using the **gltf-transform** package (_texture resizing_, _draco compression_, etc)
4. Uploads the resulting model to remote bucket in available storage provider or just moves to public directory to serve locally

## Storage providers

Resulting models can be uploaded to different providers by setting the value of the **STORAGE_PROVIDER** env var with any of the following:

- **local**: Used to store files locally after being processed. They are simply moved to _public/_ folder to be statically served by Express
- **s3**: Amazon S3 bucket
- **unity**: Unity's new Cloud Content Delivery system
