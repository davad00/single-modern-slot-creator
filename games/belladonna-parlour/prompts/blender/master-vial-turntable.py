"""master-vial-turntable.py — Belladonna's Parlour master-vial HUD turntable.

Builds a model-light stand-in of the master vial (blown-glass vessel on a brass
collar and walnut base, luminous chartreuse essence inside) from primitives +
procedural materials, then renders a transparent-PNG yaw turntable for the HUD
win-state spin (img.ui.hud_vial animation layers).

Headless (argument ORDER matters after `--`):

    blender --background --python master-vial-turntable.py -- <out_dir> [frames] [size]

    <out_dir>  frames directory (created if missing)   default ./renders/vial-turntable
    [frames]   frame count, default 24 (15 deg/step)
    [size]     square render px, default 1024

Also runs inside a live/MCP Blender session (portability fixes included:
factory-reset fallback, view_layer active-object access, engine-enum probe).
Frames: vial_turn_000.png .. ; atlas them per prompts/art-generation pipeline.
Palette: orb essence #A8C94E, brass #A98546, walnut #5C4634 (style bible lock).
"""

import math
import sys
from pathlib import Path

import bpy


def cli_args():
    argv = sys.argv
    args = argv[argv.index("--") + 1:] if "--" in argv else []
    out_dir = Path(args[0]) if len(args) > 0 else Path("./renders/vial-turntable")
    frames = int(args[1]) if len(args) > 1 else 24
    size = int(args[2]) if len(args) > 2 else 1024
    return out_dir, frames, size


def _lin(c):
    # sRGB hex -> linear (Blender colour sockets are linear)
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(h, alpha=1.0):
    h = h.lstrip("#")
    return tuple(_lin(int(h[i : i + 2], 16) / 255) for i in (0, 2, 4)) + (alpha,)


def make_glass():
    # Stylized alpha-blend glass: EEVEE's Glass BSDF renders near-black without
    # screen-space refraction; a translucent Principled reads correctly in the
    # painterly 2.5D style and shows the essence through the vessel.
    mat = bpy.data.materials.new("bp_poison_glass")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_rgba("6C4E91")  # belladonna violet
    bsdf.inputs["Roughness"].default_value = 0.08
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 0.6
    bsdf.inputs["Alpha"].default_value = 0.42
    nt.links.new(bsdf.outputs[0], out.inputs["Surface"])
    try:
        mat.blend_method = "BLEND"
    except AttributeError:
        pass  # newer Blender versions handle alpha automatically
    return mat


def make_essence():
    mat = bpy.data.materials.new("bp_essence")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = hex_rgba("A8C94E")  # orb essence
    emit.inputs["Strength"].default_value = 4.0
    nt.links.new(emit.outputs[0], out.inputs["Surface"])
    return mat


def make_metal(hex_col, rough=0.35):
    mat = bpy.data.materials.new("bp_brass")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_rgba(hex_col)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = rough
    nt.links.new(bsdf.outputs[0], out.inputs["Surface"])
    return mat


def active_obj():
    # live/MCP sessions lack bpy.context.active_object in handler contexts
    return bpy.context.view_layer.objects.active


def build_scene(size):
    # Headless uses the factory reset; interactive/MCP sandboxes block it and
    # allow the equivalent empty-homefile reset instead.
    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
    except RuntimeError:
        bpy.ops.wm.read_homefile(use_empty=True, use_factory_startup=True)
    scene = bpy.context.scene

    glass, essence = make_glass(), make_essence()
    brass = make_metal("A98546")
    walnut = make_metal("5C4634", rough=0.7)

    # vessel: elongated sphere body
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.9, location=(0, 0, 1.15))
    body = active_obj()
    body.name = "vial_body"
    body.scale = (0.72, 0.72, 1.0)
    body.data.materials.append(glass)
    bpy.ops.object.shade_smooth()

    # essence: inner luminous fluid (lower two thirds)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.62, location=(0, 0, 0.95))
    core = active_obj()
    core.name = "vial_essence"
    core.scale = (0.62, 0.62, 0.78)
    core.data.materials.append(essence)
    bpy.ops.object.shade_smooth()

    # neck + brass collar + stopper
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.2, depth=0.7, location=(0, 0, 2.25))
    neck = active_obj()
    neck.name = "vial_neck"
    neck.data.materials.append(glass)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.24, minor_radius=0.05, location=(0, 0, 2.0))
    collar = active_obj()
    collar.name = "vial_collar"
    collar.data.materials.append(brass)
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.16, depth=0.34, location=(0, 0, 2.75))
    stopper = active_obj()
    stopper.name = "vial_stopper"
    stopper.data.materials.append(glass)

    # walnut base plinth
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.55, depth=0.18, location=(0, 0, 0.09))
    base = active_obj()
    base.name = "vial_base"
    base.data.materials.append(walnut)

    # filigree feet (brass spheres)
    for i, ang in enumerate((0, 2.094, 4.189)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(0.45 * math.cos(ang), 0.45 * math.sin(ang), 0.05))
        foot = active_obj()
        foot.name = f"vial_foot_{i}"
        foot.data.materials.append(brass)

    # pivot for the turntable
    bpy.ops.object.empty_add(location=(0, 0, 1.2))
    pivot = active_obj()
    pivot.name = "turn_pivot"
    for name in ("vial_body", "vial_essence", "vial_neck", "vial_collar", "vial_stopper", "vial_base",
                 "vial_foot_0", "vial_foot_1", "vial_foot_2"):
        bpy.data.objects[name].parent = pivot

    # lighting per style anchor: warm candle key lower-left, cool moon rim upper-right
    bpy.ops.object.light_add(type="AREA", location=(-2.4, -1.6, 0.9))
    key = active_obj()
    key.data.energy = 320
    key.data.color = hex_rgba("E8B36A")[:3]
    key.rotation_euler = (math.radians(70), 0, math.radians(-35))
    bpy.ops.object.light_add(type="AREA", location=(2.2, 1.8, 3.2))
    rim = active_obj()
    rim.data.energy = 180
    rim.data.color = hex_rgba("B9C7D9")[:3]
    rim.rotation_euler = (math.radians(-45), 0, math.radians(140))

    # orthographic front camera (symbols share this camera language)
    bpy.ops.object.camera_add(location=(0, -6.0, 1.35), rotation=(math.radians(90), 0, 0))
    cam = active_obj()
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 3.6
    scene.camera = cam

    # Engine id differs across Blender versions — probe what this build offers.
    engines = bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    scene.render.film_transparent = True
    try:
        scene.view_settings.view_transform = "Standard"  # keep palette hexes true
    except Exception:  # noqa: BLE001
        pass
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    return pivot


def main():
    out_dir, frames, size = cli_args()
    out_dir.mkdir(parents=True, exist_ok=True)
    pivot = build_scene(size)
    scene = bpy.context.scene
    for f in range(frames):
        pivot.rotation_euler = (0, 0, math.radians(360.0 * f / frames))
        scene.render.filepath = str(out_dir / f"vial_turn_{f:03d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"rendered frame {f + 1}/{frames}")
    print(f"done: {frames} frames at {size}x{size} in {out_dir}")


if __name__ == "__main__":
    main()
