import bpy
import os
import sys

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

    if extension == ".dae":
        bpy.ops.wm.collada_import(filepath = modelPath, 
                      auto_connect = True, 
                      find_chains = True, 
                      fix_orientation = True) 

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


