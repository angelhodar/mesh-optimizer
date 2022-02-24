import bpy
import os
import sys

'''
Description: A Python Tool that decimates an OBJ 3D model into lower resolutions (in nb of faces)
It uses the Blender Python API.
Requirements: You need only to install Blender first on the OS in question
          Example in Ubuntu Server 16.04: 'sudo apt-get install blender'
          Example in Fedora 26:           'sudo dnf install blender'
          Make sure you can call Blender from cmd/terminal etc...
Usage: blender -b -P blenderSimplify.py -- --ratio 0.5 --inm 'Original_Mesh.obj' --outm 'Output_Mesh.obj'
After --inm:  you specify the original mesh to import for decimation
      --outm: you specify the final output mesh name to export
      --ratio: this ratio should be between 0.1 and 1.0(no decimation occurs). If you choose
      Per example --ratio 0.5 meaning you half the number of faces so if your model is 300K faces
      it will be exported as 150K faces
PS: this tool does not try to preserve the integrity of the mesh so be carefull in choosing
the ratio (try not choose a very low ratio)
Enjoy!
'''

modifierName = 'DecimateMod'
 
modelPath = sys.argv[5]
decimateRatio = float(sys.argv[6])

directory = os.path.dirname(modelPath)
[filename, extension] = os.path.splitext(os.path.basename(modelPath))

bpy.ops.wm.read_factory_settings(use_empty=True)

def decimate(ratio):
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]

    print(f'Model has {len(meshes)} meshes...')

    for i, obj in enumerate(meshes):
        bpy.context.view_layer.objects.active = obj
        previous_verts = len(obj.data.vertices)
        print(f'Processing mesh {i}/{len(meshes)}')
        modifier = obj.modifiers.new(modifierName, 'DECIMATE')
        modifier.ratio = ratio
        modifier.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=modifierName)
        after_verts = len(obj.data.vertices)
        print(f'Reduced mesh {i}/{len(meshes)} verts from {previous_verts} verts to {after_verts}')


def import_model():
    if extension == ".blend":
        bpy.ops.wm.open_mainfile(filepath=modelPath) 

    if extension == ".fbx":
        bpy.ops.import_scene.fbx(filepath=modelPath)    

    if extension == ".obj":
        bpy.ops.import_scene.obj(filepath=modelPath)    

    if extension == ".ply":
        bpy.ops.import_mesh.ply(filepath=modelPath)

    if extension == ".gltf" or extension == ".glb":
        bpy.ops.import_mesh.gltf(filepath=modelPath)     

    if extension == ".stl":
        bpy.ops.import_mesh.stl(filepath=modelPath)

def export_model():
    export_file = directory + "/" + filename + ".gltf"
    print("Writing: '" + export_file + "'")
    bpy.ops.export_scene.gltf(filepath=export_file)


import_model()
decimate(decimateRatio)
export_model()


