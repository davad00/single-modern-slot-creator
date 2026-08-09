"""hero-symbol-turntable.py - Kilnspire H1 "Star-Glass Orb" turntable renderer.

Builds a model-light stand-in of the H1 hero symbol (star-glass orb in a
three-clawed brass cradle) entirely from primitives + procedural materials,
then renders a 24-frame yaw turntable (15 degrees per frame) as transparent
PNGs for the win-state spin animation sprite sheet.

Run headless (argument ORDER matters - everything after `--` is read
positionally by this script):

    blender --background --python hero-symbol-turntable.py -- <out_dir> [frames] [size]

    <out_dir>  directory PNG frames are written into (created if missing)
    [frames]   turntable frame count, default 24 (15 deg/step)
    [size]     square render size in px, default 1024 (rendered at 2x and
               downscaled by your packer for cheap anti-aliasing if desired)

Example:
    blender --background --python hero-symbol-turntable.py -- ./renders/h1-turntable 24 1024

The script is idempotent: it builds its own scene from scratch in a fresh
Blender session and never touches an existing .blend. Frame files are named
h1_turn_000.png .. h1_turn_023.png; montage them into a sheet + JSON frame map
with your atlas packer (see prompts/art-generation.md section 5b).
"""

import math
import sys
from pathlib import Path

import bpy


# ----------------------------------------------------------------- arguments
def cli_args():
    argv = sys.argv
    args = argv[argv.index("--") + 1:] if "--" in argv else []
    out_dir = Path(args[0]) if len(args) > 0 else Path("./renders/h1-turntable")
    frames = int(args[1]) if len(args) > 1 else 24
    size = int(args[2]) if len(args) > 2 else 1024
    return out_dir, frames, size


# ------------------------------------------------------------------ materials
def make_glass_material():
    # Hot star-glass: emissive core color driven through a fresnel mix so the
    # rim stays cooler than the heart of the orb (style bible lighting rule).
    mat = bpy.data.materials.new("kiln_star_glass")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    mix = nt.nodes.new("ShaderNodeMixShader")
    fresnel = nt.nodes.new("ShaderNodeFresnel")
    fresnel.inputs["IOR"].default_value = 1.45
    glass = nt.nodes.new("ShaderNodeBsdfGlass")
    glass.inputs["Color"].default_value = (1.0, 0.79, 0.42, 1.0)  # glass-hot #FFC96B
    glass.inputs["Roughness"].default_value = 0.05
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (1.0, 0.48, 0.18, 1.0)  # molten #FF7A2F
    emit.inputs["Strength"].default_value = 6.0
    nt.links.new(fresnel.outputs["Fac"], mix.inputs["Fac"])
    nt.links.new(emit.outputs["Emission"], mix.inputs[1])   # core: emissive
    nt.links.new(glass.outputs["BSDF"], mix.inputs[2])      # rim: glassy
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return mat


def make_brass_material():
    mat = bpy.data.materials.new("kiln_brass")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.788, 0.541, 0.176, 1.0)  # brass #C98A2D
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.35
    return mat


# -------------------------------------------------------------------- scene
def build_scene(size):
    # Fresh scene: remove default objects, keep a clean deterministic build.
    # Headless uses the factory reset; interactive/MCP sandboxes block it and
    # allow the equivalent empty-homefile reset instead.
    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
    except RuntimeError:
        bpy.ops.wm.read_homefile(use_empty=True, use_factory_startup=True)
    scene = bpy.context.scene

    glass = make_glass_material()
    brass = make_brass_material()

    # The orb: a subdivided icosphere with the star-glass material.
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=1.0, location=(0, 0, 0))
    orb = bpy.context.view_layer.objects.active
    orb.name = "h1_orb"
    orb.data.materials.append(glass)
    bpy.ops.object.shade_smooth()

    # The inner star core: small emissive icosphere (reads through the glass).
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.35, location=(0, 0, 0))
    core = bpy.context.view_layer.objects.active
    core.name = "h1_core"
    core_mat = bpy.data.materials.new("kiln_core")
    core_mat.use_nodes = True
    nt = core_mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (1.0, 0.843, 0.369, 1.0)  # win #FFD75E
    emit.inputs["Strength"].default_value = 40.0
    nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
    core.data.materials.append(core_mat)

    # Three brass cradle claws: scaled, tilted cylinders placed 120 deg apart.
    # Extruded-emblem stand-ins - real production would sculpt these; the
    # turntable pipeline is identical either way.
    for i in range(3):
        angle = math.radians(i * 120)
        x, y = 1.05 * math.cos(angle), 1.05 * math.sin(angle)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=0.12, depth=1.1, location=(x, y, -0.35))
        claw = bpy.context.view_layer.objects.active
        claw.name = f"h1_claw_{i}"
        # tilt each claw so it hugs the orb
        claw.rotation_euler = (math.radians(28) * math.cos(angle),
                               math.radians(28) * math.sin(angle), 0)
        claw.data.materials.append(brass)
        bpy.ops.object.shade_smooth()

    # Brass base ring under the orb.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.75, minor_radius=0.09,
                                     location=(0, 0, -0.95))
    ring = bpy.context.view_layer.objects.active
    ring.name = "h1_ring"
    ring.data.materials.append(brass)
    bpy.ops.object.shade_smooth()

    # Parent everything to a rotating empty - the turntable pivot.
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    pivot = bpy.context.view_layer.objects.active
    pivot.name = "turntable_pivot"
    for name in ("h1_orb", "h1_core", "h1_ring", *(f"h1_claw_{i}" for i in range(3))):
        obj = bpy.data.objects[name]
        obj.select_set(True)
        # keep transforms: set parent without moving the children
        obj.parent = pivot
        obj.matrix_parent_inverse = pivot.matrix_world.inverted()
        obj.select_set(False)

    # Light rig per the style bible: warm key lower-left, teal rim upper-right.
    bpy.ops.object.light_add(type="AREA", location=(-3.0, -2.0, -0.5))
    key = bpy.context.view_layer.objects.active
    key.data.energy = 400
    key.data.color = (1.0, 0.62, 0.30)  # furnace-warm key
    key.rotation_euler = (math.radians(75), 0, math.radians(-55))

    bpy.ops.object.light_add(type="AREA", location=(2.5, 2.0, 2.5))
    rim = bpy.context.view_layer.objects.active
    rim.data.energy = 220
    rim.data.color = (0.50, 0.85, 0.83)  # teal rim #7FD8D4
    rim.rotation_euler = (math.radians(-35), 0, math.radians(130))

    # Orthographic front-on camera (symbols share this camera per style bible).
    bpy.ops.object.camera_add(location=(0, -6.0, 0),
                              rotation=(math.radians(90), 0, 0))
    cam = bpy.context.view_layer.objects.active
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 3.4  # ~10% negative-space margin around the emblem
    scene.camera = cam

    # Render settings: Eevee, transparent film, square output.
    # Engine id differs across Blender versions (4.2 "BLENDER_EEVEE_NEXT",
    # 4.5+/5.x back to "BLENDER_EEVEE") — pick from what this build offers.
    _engines = bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
    scene.render.engine = (
        "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in _engines else "BLENDER_EEVEE"
    )
    scene.render.film_transparent = True
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    return pivot


# -------------------------------------------------------------------- render
def render_turntable(pivot, out_dir: Path, frames: int):
    out_dir.mkdir(parents=True, exist_ok=True)
    step = 2 * math.pi / frames
    for f in range(frames):
        pivot.rotation_euler[2] = f * step  # yaw only; 15 deg/frame at 24 frames
        bpy.context.scene.render.filepath = str(out_dir / f"h1_turn_{f:03d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"rendered frame {f + 1}/{frames}")


def main():
    out_dir, frames, size = cli_args()
    pivot = build_scene(size)
    render_turntable(pivot, out_dir, frames)
    print(f"done: {frames} frames at {size}x{size} in {out_dir}")


if __name__ == "__main__":
    main()
