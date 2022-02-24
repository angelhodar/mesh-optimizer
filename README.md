# mesh-optimizer

![Blender and Docker](./cover.png)

## Introduction

This project contains a Blender-powered docker container pipeline that automatically converts any 3D model (obj, fbx, stl, gltf, etc) to a compressed and optimized single .glb file.
It offers a simple HTTP API to interact with the container and also provides some interfaces to upload the resulting file to 3 different storage providers: LocalProvider, S3Provider and UnityProvider.

## Pipeline

The whole pipeline consists in 4 steps:

1. Decompress zip file with mesh and textures in a folder inside ./tmp directoy
2. Executes Blender in headless mode passing the mesh path as paramter to python script which converts to .glb and reduce polygon complexity
3. Pass some gltf transformations and optimizations using the **gltf-transform** package (*texture resizing*, *draco compression*, etc).
4. Uploads the resulting model to remote bucket in available storage provider or just moves to public directory to serve locally.

## Storage providers

Resulting models can be uploaded to different providers by setting the value of the **STORAGE_PROVIDER** env var with any of the following:

- **local**: Used to store files locally after being processed.
- **s3**: Amazon S3 bucket
- **unity**: Unity's new Cloud Content Delivery system

