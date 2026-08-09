"""parlour-parallax-layers.py — base-game parlour parallax plates from one 3D scene.

Models a stand-in of the midnight parlour (cabinet wall, counter with bottles,
hanging lamps) from primitives, then renders THREE camera-shifted plates so the
2D client gets true-perspective parallax (img.env.base.layer0/1/2 stand-ins):

    layer0  far   opaque   cabinet wall + deep room
    layer1  mid   alpha    counter + bottle clusters
    layer2  near  alpha    hanging lamp + foreground posts (edges only)

Headless:

    blender --background --python parlour-parallax-layers.py -- <out_dir> [width] [height]

Defaults: ./renders/parlour-parallax 2048 1024. Camera shifts ±0.12 units per
depth for plate separation; horizon locked at 44% frame height (style bible).
Portability: factory-reset fallback, view_layer active-object, engine probe.
"""

import math
import sys
from pathlib import Path

import bpy


def cli_args():
    argv = sys.argv
    args = argv[argv.index("--") + 1:] if "--" in argv else []
    out = Path(args[0]) if len(args) > 0 else Path("./renders/parlour-parallax")
    w = int(args[1]) if len(args) > 1 else 2048
    h = int(args[2]) if len(args) > 2 else 1024
    return out, w, h


def _lin(c):
    # sRGB hex -> linear (Blender colour sockets are linear)
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(hx, a=1.0):
    hx = hx.lstrip("#")
    return tuple(_lin(int(hx[i : i + 2], 16) / 255) for i in (0, 2, 4)) + (a,)


def flat(name, hx, emit=0.0, rough=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if emit > 0:
        sh = nt.nodes.new("ShaderNodeEmission")
        sh.inputs["Color"].default_value = hex_rgba(hx)
        sh.inputs["Strength"].default_value = emit
    else:
        sh = nt.nodes.new("ShaderNodeBsdfPrincipled")
        sh.inputs["Base Color"].default_value = hex_rgba(hx)
        sh.inputs["Roughness"].default_value = rough
    nt.links.new(sh.outputs[0], out.inputs["Surface"])
    return m


def active_obj():
    return bpy.context.view_layer.objects.active


def add_box(name, size, loc, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = active_obj()
    o.name = name
    o.scale = size
    o.data.materials.append(mat)
    return o


def build_scene(w, h):
    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
    except RuntimeError:
        bpy.ops.wm.read_homefile(use_empty=True, use_factory_startup=True)
    scene = bpy.context.scene

    walnut = flat("bp_walnut", "5C4634")
    deep = flat("bp_deep", "241B2F", rough=0.9)
    brass = flat("bp_brass2", "A98546", rough=0.35)
    glassy = flat("bp_bottleglass", "6C4E91", rough=0.2)
    poison = flat("bp_bottlepoison", "74A12E", rough=0.2)
    candle = flat("bp_candle", "E8B36A", emit=6.0)

    # ---- depth 0 (far, y=6): cabinet wall ----
    add_box("wall", (14, 0.2, 6), (0, 6, 2.2), deep)
    for i in range(-3, 4):
        add_box(f"cab_{i}", (1.6, 0.3, 4.2), (i * 1.9, 5.7, 2.1), walnut)
        for s in range(3):
            add_box(f"shelf_{i}_{s}", (1.5, 0.32, 0.06), (i * 1.9, 5.68, 1.1 + s * 1.1), brass)

    # ---- depth 1 (mid, y=3): counter + bottle clusters ----
    add_box("counter", (10, 1.2, 1.2), (0, 3, 0.55), walnut)
    for i, (x, mat, r, hgt) in enumerate(
        [(-3.4, glassy, 0.18, 0.8), (-2.9, poison, 0.13, 0.55), (2.8, poison, 0.2, 0.7),
         (3.5, glassy, 0.14, 0.9), (4.1, glassy, 0.11, 0.5), (-4.2, poison, 0.16, 0.65)]
    ):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=hgt, location=(x, 3, 1.1 + hgt / 2))
        b = active_obj()
        b.name = f"bottle_{i}"
        b.data.materials.append(mat)
    # candles on the counter ends
    for j, x in enumerate((-4.6, 4.6)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.05, depth=0.3, location=(x, 3, 1.3))
        c = active_obj()
        c.name = f"candle_{j}"
        c.data.materials.append(candle)

    # ---- depth 2 (near, y=0.8): hanging lamp + side posts (edges only) ----
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(-4.9, 0.8, 3.6))
    lamp = active_obj()
    lamp.name = "hang_lamp"
    lamp.data.materials.append(brass)
    add_box("post_l", (0.25, 0.25, 6), (-5.9, 0.8, 2.4), walnut)
    add_box("post_r", (0.25, 0.25, 6), (5.9, 0.8, 2.4), walnut)

    # lights per style anchor
    bpy.ops.object.light_add(type="AREA", location=(-4, -2, 1.5))
    key = active_obj()
    key.data.energy = 900
    key.data.color = hex_rgba("E8B36A")[:3]
    bpy.ops.object.light_add(type="AREA", location=(4, -1, 5))
    rim = active_obj()
    rim.data.energy = 420
    rim.data.color = hex_rgba("B9C7D9")[:3]

    # camera: horizon at 44% => slight downward frame shift
    bpy.ops.object.camera_add(location=(0, -8.5, 2.0), rotation=(math.radians(90), 0, 0))
    cam = active_obj()
    cam.data.lens = 42
    cam.data.shift_y = -0.06  # pushes horizon to ~44% frame height
    scene.camera = cam

    engines = bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    try:
        scene.view_settings.view_transform = "Standard"  # keep palette hexes true
    except Exception:  # noqa: BLE001
        pass
    scene.render.film_transparent = True
    scene.render.resolution_x = w
    scene.render.resolution_y = h
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    return cam


LAYERS = {
    "layer0": dict(prefixes=("wall", "cab_", "shelf_"), shift=0.0),
    "layer1": dict(prefixes=("counter", "bottle_", "candle_"), shift=0.06),
    "layer2": dict(prefixes=("hang_lamp", "post_"), shift=0.12),
}


def render_layers(cam, out_dir):
    scene = bpy.context.scene
    meshes = [o for o in scene.objects if o.type == "MESH"]
    base_x = cam.location.x
    for name, cfg in LAYERS.items():
        for o in meshes:
            o.hide_render = not any(o.name.startswith(p) for p in cfg["prefixes"])
        cam.location.x = base_x + cfg["shift"]
        scene.render.filepath = str(out_dir / f"parlour_{name}.png")
        bpy.ops.render.render(write_still=True)
        print(f"rendered {name}")
    for o in meshes:
        o.hide_render = False
    cam.location.x = base_x


def main():
    out_dir, w, h = cli_args()
    out_dir.mkdir(parents=True, exist_ok=True)
    cam = build_scene(w, h)
    render_layers(cam, out_dir)
    print(f"done: 3 parallax plates at {w}x{h} in {out_dir}")


if __name__ == "__main__":
    main()
