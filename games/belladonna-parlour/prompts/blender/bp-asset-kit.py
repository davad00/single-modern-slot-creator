"""bp-asset-kit.py — Belladonna's Parlour Blender asset kit.

Models and renders every Blender-viable asset as stylized primitive assemblies
with palette-locked procedural materials (style bible §6/§17): 13 symbol
sprites, cabinet frame, cell plates, UI buttons, panels, win plates, HUD
elements, VFX textures, plus opaque backdrop/splash/icon/thumbnail scenes.

Headless:  blender --background --python bp-asset-kit.py -- <out_root> [only]
  <out_root>  render root (subfolders per category)
  [only]      optional comma-list of asset keys to (re)render

Also runs in a live/MCP session (portable: factory-reset fallback,
view_layer active-object, engine probe). Per-asset try/except — one failure
never kills the batch; a status dict is printed at the end.
"""

import math
import sys
from pathlib import Path

import bpy

# ------------------------------------------------------------------ palette
PAL = {
    "bg_deep": "120D16", "bg_mid": "241B2F", "playfield": "1B1512",
    "brass": "A98546", "walnut": "5C4634", "action": "D98E2B",
    "win": "EFC75E", "danger": "B3402E", "text": "E9E0CB",
    "scatter": "8C2E52", "orb": "A8C94E", "poison": "74A12E",
    "violet": "6C4E91", "moon": "B9C7D9", "tier_f": "C98F3D",
    "tier_s": "4E8A6A", "tier_u": "9B7BC4", "candle": "E8B36A",
}


def _srgb_to_linear(c: float) -> float:
    # Blender colour sockets are LINEAR; palette hexes are sRGB. Without this
    # conversion every colour renders one gamma-lift too light (pink wax bug).
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgba(key, a=1.0):
    h = PAL[key] if key in PAL else key
    srgb = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return tuple(_srgb_to_linear(c) for c in srgb) + (a,)


def cli_args():
    argv = sys.argv
    args = argv[argv.index("--") + 1:] if "--" in argv else []
    root = Path(args[0]) if len(args) > 0 else Path("./renders/asset-kit")
    only = set(args[1].split(",")) if len(args) > 1 else None
    return root, only


def active():
    return bpy.context.view_layer.objects.active


# ---------------------------------------------------------------- materials
_matn = [0]


def _mat(name):
    _matn[0] += 1
    m = bpy.data.materials.new(f"bp_{name}_{_matn[0]}")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    return m, nt, out


def glass(key, alpha=0.45, rough=0.08):
    m, nt, out = _mat("glass")
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = rgba(key)
    b.inputs["Roughness"].default_value = rough
    if "Transmission Weight" in b.inputs:
        b.inputs["Transmission Weight"].default_value = 0.55
    b.inputs["Alpha"].default_value = alpha
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    try:
        m.blend_method = "BLEND"
    except AttributeError:
        pass
    return m


def metal(key, rough=0.32):
    m, nt, out = _mat("metal")
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = rgba(key)
    b.inputs["Metallic"].default_value = 1.0
    b.inputs["Roughness"].default_value = rough
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    return m


def matte(key, rough=0.75, alpha=1.0):
    # Diffuse + a low emissive floor of the SAME hex: keeps the locked palette
    # colour dominant under any light rig (stylized-sprite hue fidelity).
    m, nt, out = _mat("matte")
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = rgba(key)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Alpha"].default_value = alpha
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = rgba(key)
    e.inputs["Strength"].default_value = 0.45
    add = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(b.outputs[0], add.inputs[0])
    nt.links.new(e.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs["Surface"])
    if alpha < 1.0:
        try:
            m.blend_method = "BLEND"
        except AttributeError:
            pass
    return m


def glow(key, strength=4.0):
    m, nt, out = _mat("glow")
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = rgba(key)
    e.inputs["Strength"].default_value = strength
    nt.links.new(e.outputs[0], out.inputs["Surface"])
    return m


# ------------------------------------------------------------ scene helpers
def reset_scene():
    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
    except RuntimeError:
        bpy.ops.wm.read_homefile(use_empty=True, use_factory_startup=True)


def rig(res_x=1024, res_y=1024, ortho=3.4, cam_z=1.0):
    scene = bpy.context.scene
    # Standard view transform: AgX/Filmic wash out the locked palette hexes on
    # stylized flat sprites — Standard keeps them true.
    try:
        bpy.context.scene.view_settings.view_transform = "Standard"
    except Exception:  # noqa: BLE001
        pass
    bpy.ops.object.light_add(type="AREA", location=(-2.6, -2.0, 0.6))
    key = active()
    key.data.energy = 170
    key.data.size = 3.5
    key.data.color = rgba("candle")[:3]
    key.rotation_euler = (math.radians(75), 0, math.radians(-40))
    bpy.ops.object.light_add(type="AREA", location=(2.4, -1.2, 3.4))
    rim = active()
    rim.data.energy = 180
    rim.data.size = 3.0
    rim.data.color = rgba("moon")[:3]
    rim.rotation_euler = (math.radians(-40), 0, math.radians(150))
    bpy.ops.object.light_add(type="AREA", location=(0, -5, 1.0))
    fill = active()
    fill.data.energy = 60
    fill.data.size = 6.0
    fill.data.color = rgba("text")[:3]
    fill.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.camera_add(location=(0, -6.0, cam_z), rotation=(math.radians(90), 0, 0))
    cam = active()
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = ortho
    scene.camera = cam
    engines = bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    scene.render.film_transparent = True
    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    return cam


def render_to(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


# primitive shorthands ------------------------------------------------------
def sphere(loc, r=1.0, scale=(1, 1, 1), mat=None, seg=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = active()
    o.scale = scale
    if mat:
        o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return o


def cyl(loc, r=0.5, depth=1.0, mat=None, verts=32, rot=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = active()
    o.scale = scale
    if mat:
        o.data.materials.append(mat)
    if verts >= 16:
        bpy.ops.object.shade_smooth()
    return o


def cone(loc, r1=0.5, r2=0.0, depth=1.0, mat=None, verts=32, rot=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = active()
    o.scale = scale
    if mat:
        o.data.materials.append(mat)
    return o


def torus(loc, R=0.5, r=0.06, mat=None, rot=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot)
    o = active()
    o.scale = scale
    if mat:
        o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return o


def box(loc, size=(1, 1, 1), mat=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = active()
    o.scale = size
    if mat:
        o.data.materials.append(mat)
    return o


# ---------------------------------------------------------- symbol builders
# Front-on ortho: camera looks along +Y; put detail at y<=0 (toward camera).


def sym_h1():
    """Belladonna Philtre — amethyst teardrop, brass collar, black-flower charm."""
    g = glass("violet", 0.5)
    sphere((0, 0, 0.95), 0.78, (0.82, 0.82, 1.12), g)
    sphere((0, 0, 0.85), 0.4, (0.5, 0.5, 0.62), glow("violet", 1.6))  # inner luminance
    cyl((0, 0, 2.05), 0.16, 0.5, glass("violet", 0.5))
    torus((0, 0, 1.86), 0.2, 0.05, metal("brass"))
    sphere((0, 0, 2.38), 0.14, (1, 1, 1), metal("brass", 0.25))
    dark = matte("bg_deep", 0.5)
    for k in range(5):  # black flower charm on the belly
        a = k * 2 * math.pi / 5
        sphere((0.16 * math.cos(a), -0.72, 0.95 + 0.16 * math.sin(a)), 0.075, (1, 0.5, 1), dark)
    sphere((0, -0.76, 0.95), 0.06, (1, 0.6, 1), glow("win", 2.0))


def sym_h2():
    """Serpent's Emerald — tall flask coiled by a glass serpent."""
    g = glass("poison", 0.48)
    cyl((0, 0, 0.95), 0.42, 1.5, g)
    sphere((0, 0, 1.8), 0.3, (1, 1, 0.7), g)
    cyl((0, 0, 0.16), 0.5, 0.14, metal("brass"))
    snake = glass("tier_s", 0.85, 0.2)
    for i, z in enumerate((0.5, 0.85, 1.2, 1.55)):
        torus((0, 0, z), 0.48 - i * 0.02, 0.075, snake, rot=(math.radians(8 if i % 2 else -8), 0, 0))
    sphere((0.42, -0.25, 1.75), 0.12, (1.3, 1, 0.8), snake)  # head
    sphere((0.47, -0.34, 1.77), 0.03, (1, 1, 1), glow("win", 3.0))  # eye


def sym_h3():
    """Widow's Amber — squat hex jar, beetle suspended inside."""
    cyl((0, 0, 0.85), 0.72, 1.1, glass("tier_f", 0.5), verts=6)
    cyl((0, 0, 1.52), 0.5, 0.16, metal("brass"), verts=6)
    sphere((0, 0, 0.8), 0.5, (0.9, 0.9, 0.75), glow("tier_f", 0.9))  # amber inner glow
    body = matte("bg_deep", 0.4)
    sphere((0, -0.3, 0.82), 0.16, (1, 0.7, 1.2), body)  # beetle
    sphere((0, -0.34, 0.98), 0.08, (1, 0.8, 1), body)
    for s in (-1, 1):  # legs
        for dz in (-0.08, 0.0, 0.08):
            cyl((s * 0.17, -0.32, 0.82 + dz), 0.014, 0.16, body, verts=8,
                rot=(0, math.radians(70 * s), 0))


def sym_h4():
    """Moth-Wing Tonic — slim teal phial with wing-flared stopper."""
    g = glass("moon", 0.42, 0.05)
    cyl((0, 0, 0.85), 0.26, 1.3, g)
    sphere((0, 0, 0.55), 0.2, (1, 1, 0.8), glow("tier_s", 1.4))
    torus((0, 0, 1.55), 0.16, 0.045, metal("brass"))
    wing = matte("text", 0.6, 0.9)
    for s in (-1, 1):
        cone((s * 0.34, 0, 1.95), 0.3, 0.02, 0.5, wing, verts=3,
             rot=(0, math.radians(-55 * s), 0), scale=(1, 0.25, 1))
    sphere((0, 0, 1.75), 0.1, (1, 1, 1), matte("walnut"))


def sym_l1():
    """Mandrake Root — forked root with leaf sprig."""
    root = matte("walnut", 0.85)
    cone((0, 0, 1.15), 0.34, 0.16, 0.7, root)
    for s, dx in ((-1, -0.16), (1, 0.16)):
        cone((dx * 1.6, 0, 0.55), 0.15, 0.02, 0.85, root, rot=(0, math.radians(14 * s), 0))
    for s in (-1, 1):  # root hairs
        cyl((s * 0.4, 0, 0.9), 0.02, 0.35, root, verts=8, rot=(0, math.radians(45 * s), 0))
    leaf = matte("poison", 0.6)
    for s in (-1, 1):
        cone((s * 0.12, 0, 1.72), 0.1, 0.01, 0.42, leaf, rot=(0, math.radians(28 * s), 0),
             scale=(1, 0.3, 1))


def sym_l2():
    """Nightcap Mushrooms — clustered caps."""
    stem = matte("text", 0.8)
    cap = matte("danger", 0.6)
    cap2 = matte("walnut", 0.6)
    cyl((-0.25, 0, 0.75), 0.11, 0.8, stem, scale=(1, 1, 1))
    sphere((-0.25, 0, 1.2), 0.4, (1, 1, 0.62), cap)
    cyl((0.3, 0.1, 0.6), 0.09, 0.55, stem)
    sphere((0.3, 0.1, 0.92), 0.3, (1, 1, 0.6), cap2)
    cyl((0.05, -0.15, 0.5), 0.06, 0.35, stem)
    sphere((0.05, -0.15, 0.7), 0.19, (1, 1, 0.58), cap)
    for x, z in ((-0.32, 1.32), (-0.12, 1.38), (0.28, 1.03)):  # pale spots
        sphere((x, -0.32, z), 0.045, (1, 0.5, 1), matte("text", 0.5))


def sym_l3():
    """Black Lotus Pod — dark seed pod on a stem."""
    pod = matte("bg_mid", 0.55)
    sphere((0, 0, 1.15), 0.52, (1, 1, 0.55), pod)
    for k in range(7):  # seed holes on the face
        a = k * 2 * math.pi / 7
        sphere((0.3 * math.cos(a), -0.4, 1.15 + 0.22 * math.sin(a)), 0.075, (1, 0.6, 1),
               glow("orb", 0.8))
    cyl((0, 0, 0.5), 0.06, 0.8, matte("poison", 0.7), rot=(math.radians(6), 0, 0))
    for s in (-1, 1):
        cone((s * 0.3, 0, 0.62), 0.14, 0.01, 0.5, matte("poison", 0.7),
             rot=(0, math.radians(40 * s), 0), scale=(1, 0.3, 1))


def sym_l4():
    """Wax Seal & Twine — square parchment packet, cross twine, wax dot."""
    box((0, 0, 1.0), (1.35, 0.14, 1.35), matte("text", 0.85))
    box((0, -0.02, 1.0), (1.2, 0.14, 1.2), matte("E4D9BB", 0.8))
    tw = matte("walnut", 0.8)
    box((0, -0.11, 1.0), (1.36, 0.03, 0.09), tw)
    box((0, -0.11, 1.0), (0.09, 0.03, 1.36), tw)
    cyl((0, -0.16, 1.0), 0.2, 0.09, matte("scatter", 0.4), rot=(math.radians(90), 0, 0))
    sphere((0, -0.2, 1.0), 0.075, (1, 0.5, 1), matte("8C2E52", 0.35))


def sym_l5():
    """Dried Foxglove Sprig — arched stem with hanging bells."""
    stem = matte("walnut", 0.8)
    seg = 5
    for i in range(seg):  # arched stem from segments
        t = i / (seg - 1)
        x = -0.55 + 1.1 * t
        z = 0.7 + 0.9 * math.sin(math.pi * (0.15 + 0.7 * t))
        cyl((x, 0, z), 0.028, 0.42, stem, verts=8,
            rot=(0, math.radians(60 - 120 * t), 0))
    bell = matte("violet", 0.6, 0.95)
    for i, t in enumerate((0.18, 0.38, 0.58, 0.78, 0.94)):
        x = -0.55 + 1.1 * t
        z = 0.62 + 0.88 * math.sin(math.pi * (0.15 + 0.7 * t)) - 0.3
        cone((x, 0, z), 0.16 - i * 0.012, 0.055, 0.34, bell, rot=(math.pi, 0, 0))


def sym_scatter():
    """The Parlour Seal — round mulberry wax seal, flower sigil, ribbon tails."""
    wax = matte("scatter", 0.45)
    cyl((0, 0, 1.05), 0.72, 0.16, wax, rot=(math.radians(90), 0, 0))
    torus((0, -0.06, 1.05), 0.6, 0.055, matte("8C2E52", 0.35), rot=(math.radians(90), 0, 0))
    dark = matte("bg_deep", 0.5)
    for k in range(5):  # black-flower sigil
        a = k * 2 * math.pi / 5 + 0.3
        sphere((0.3 * math.cos(a), -0.12, 1.05 + 0.3 * math.sin(a)), 0.12, (1, 0.45, 1), dark)
    sphere((0, -0.15, 1.05), 0.11, (1, 0.5, 1), glow("win", 1.8))
    rib = matte("6E2440", 0.6)
    for s in (-1, 1):
        box((s * 0.42, 0.08, 0.35), (0.22, 0.05, 0.85), rib, rot=(0, math.radians(-14 * s), 0))
        cone((s * 0.58, 0.08, -0.06), 0.11, 0.11, 0.2, rib, verts=4)


def sym_mult():
    """Essence Orb — crowned glass sphere of luminous essence."""
    sphere((0, 0, 0.95), 0.66, (1, 1, 1), glass("orb", 0.4, 0.05))
    sphere((0, 0, 0.92), 0.44, (1, 1, 1), glow("orb", 5.0))
    ring = metal("brass", 0.28)
    torus((0, 0, 1.58), 0.3, 0.05, ring)
    for k in range(5):  # crown spikes
        a = k * 2 * math.pi / 5
        cone((0.3 * math.cos(a), 0.3 * math.sin(a), 1.72), 0.055, 0.0, 0.24, ring)
    cyl((0, 0, 0.28), 0.34, 0.1, ring)


def sym_mult_plate():
    """Essence value plate — small brass plaque (numerals render in-engine)."""
    box((0, 0, 1.0), (1.5, 0.12, 0.8), metal("brass", 0.4))
    box((0, -0.05, 1.0), (1.34, 0.12, 0.64), matte("1B1512", 0.6))
    for s in (-1, 1):
        sphere((s * 0.62, -0.12, 1.0), 0.05, (1, 0.6, 1), metal("brass", 0.25))


def sym_fx1():
    """The Prisming Vial — slim vial with sharp triangular prism stopper."""
    cyl((0, 0, 0.75), 0.24, 1.05, glass("moon", 0.34, 0.04))
    sphere((0, 0, 0.5), 0.17, (1, 1, 0.75), glow("tier_u", 2.2))
    torus((0, 0, 1.32), 0.16, 0.04, metal("brass"))
    cone((0, 0, 1.78), 0.34, 0.0, 0.75, glass("tier_u", 0.5, 0.03), verts=3)
    cone((0, -0.05, 1.7), 0.14, 0.0, 0.4, glow("moon", 2.5), verts=3)  # inner refraction spark


# ------------------------------------------------- frame / ui / vfx builders
def frame_reel():
    w = matte("playfield", 0.7)
    brass = metal("brass", 0.38)
    box((0, 0, 1.0), (4.3, 0.3, 0.16), matte("walnut", 0.8))       # top rail
    box((0, 0, -1.35), (4.3, 0.3, 0.16), matte("walnut", 0.8))     # bottom rail
    for s in (-1, 1):
        box((s * 2.08, 0, -0.175), (0.16, 0.3, 2.5), matte("walnut", 0.8))
        box((s * 1.98, -0.05, -0.175), (0.05, 0.3, 2.2), brass)
        sphere((s * 2.08, -0.1, 1.0), 0.1, (1, 0.7, 1), brass)
        sphere((s * 2.08, -0.1, -1.35), 0.1, (1, 0.7, 1), brass)
    box((0, -0.05, 0.9), (4.0, 0.3, 0.05), brass)
    box((0, -0.05, -1.25), (4.0, 0.3, 0.05), brass)
    _ = w


def frame_cell(win=False):
    edge = glow("win", 2.2) if win else metal("brass", 0.5)
    box((0, 0, 1.0), (1.5, 0.1, 1.5), matte("playfield", 0.85, 0.88))
    for dz in (-0.72, 0.72):
        box((0, -0.04, 1.0 + dz), (1.5, 0.08, 0.06), edge)
    for dx in (-0.72, 0.72):
        box((dx, -0.04, 1.0), (0.06, 0.08, 1.5), edge)


def _button_base(face_key="1B1512"):
    torus((0, 0, 1.0), 0.72, 0.11, metal("brass", 0.3), rot=(math.radians(90), 0, 0))
    cyl((0, 0, 1.0), 0.66, 0.12, matte(face_key, 0.5), rot=(math.radians(90), 0, 0))


def ui_btn_spin():
    torus((0, 0, 1.0), 0.72, 0.12, metal("brass", 0.28), rot=(math.radians(90), 0, 0))
    cyl((0, 0, 1.0), 0.66, 0.14, matte("action", 0.35), rot=(math.radians(90), 0, 0))
    torus((0, -0.1, 1.0), 0.34, 0.05, matte("1B1512", 0.5), rot=(math.radians(90), 0, 0))
    sphere((0.3, -0.12, 1.16), 0.08, (1, 0.6, 1), matte("1B1512", 0.5))  # swirl hint


def ui_btn_stop():
    _button_base()
    box((0, -0.1, 1.0), (0.5, 0.06, 0.5), metal("brass", 0.35))


def ui_btn_autoplay():
    _button_base()
    for i, x in enumerate((-0.3, 0.0, 0.3)):
        sphere((x, -0.1, 1.0), 0.1 + i * 0.02, (1, 0.6, 1), glow("action", 1.2 + i))


def ui_btn_bet():
    _button_base()
    cyl((0, -0.08, 0.9), 0.3, 0.07, metal("brass", 0.3), rot=(math.radians(90), 0, 0))
    cyl((0, -0.12, 1.08), 0.24, 0.07, metal("win" if False else "brass", 0.25),
        rot=(math.radians(90), 0, 0))


def ui_btn_buy():
    _button_base()
    cyl((0, -0.1, 0.92), 0.14, 0.5, glass("violet", 0.6))
    torus((0, -0.1, 1.2), 0.09, 0.03, metal("brass"), rot=(0, 0, 0))


def ui_btn_ante():
    _button_base()
    sphere((0, -0.1, 1.0), 0.26, (1, 0.7, 1), glow("orb", 3.0))
    torus((0, -0.1, 1.0), 0.36, 0.035, metal("brass", 0.3), rot=(math.radians(90), 0, 0))


def ui_btn_settings():
    _button_base()
    torus((0, -0.1, 1.0), 0.3, 0.09, metal("brass", 0.4), rot=(math.radians(90), 0, 0))
    for k in range(8):
        a = k * math.pi / 4
        box((0.42 * math.cos(a), -0.1, 1.0 + 0.42 * math.sin(a)), (0.1, 0.09, 0.1), metal("brass", 0.4),
            rot=(0, a, 0))


def ui_ind_spinmode():
    box((0, 0, 1.0), (1.7, 0.1, 0.6), matte("playfield", 0.7, 0.9))
    for i in range(3):
        cone((-0.4 + i * 0.4, -0.08, 1.0), 0.16, 0.0, 0.3, glow("action", 1 + i),
             rot=(math.radians(-90), 0, math.radians(90)), verts=3)


def ui_panel_hud():
    box((0, 0, 1.0), (4.4, 0.12, 1.0), matte("playfield", 0.8, 0.9))
    for dz in (-0.46, 0.46):
        box((0, -0.05, 1.0 + dz), (4.4, 0.08, 0.05), metal("brass", 0.4))


def ui_panel_overlay():
    box((0, 0, 1.0), (3.4, 0.12, 3.4), matte("bg_deep", 0.85, 0.94))
    for dz in (-1.64, 1.64):
        box((0, -0.05, 1.0 + dz), (3.4, 0.08, 0.07), metal("brass", 0.4))
    for dx in (-1.64, 1.64):
        box((dx, -0.05, 1.0), (0.07, 0.08, 3.4), metal("brass", 0.4))


def ui_hud_vial():
    cyl((0, 0, 0.9), 0.4, 1.5, glass("violet", 0.4))
    cyl((0, 0, 0.55), 0.34, 0.75, glow("orb", 4.0))
    torus((0, 0, 1.72), 0.26, 0.05, metal("brass"))
    cyl((0, 0, 0.1), 0.5, 0.14, matte("walnut", 0.8))
    for z in (0.35, 0.7, 1.05, 1.4):  # gauge ticks
        box((0.45, -0.02, z), (0.12, 0.03, 0.025), metal("brass", 0.3))


def ui_hud_dial():
    torus((0, 0, 1.0), 0.62, 0.08, metal("brass", 0.3), rot=(math.radians(90), 0, 0))
    cyl((0, 0, 1.0), 0.55, 0.09, matte("playfield", 0.6, 0.95), rot=(math.radians(90), 0, 0))
    for k in range(7):
        a = math.pi * (0.15 + 0.7 * k / 6)
        sphere((0.42 * math.cos(a), -0.08, 1.0 + 0.42 * math.sin(a)), 0.045, (1, 0.6, 1),
               glow("tier_s", 1.5))
    cone((0.12, -0.1, 1.12), 0.05, 0.0, 0.42, metal("brass", 0.2),
         rot=(0, math.radians(30), 0))


def ui_hud_prismrail():
    box((0, 0, 0.65), (2.4, 0.1, 0.1), metal("brass", 0.35))
    for i in range(3):
        cone((-0.7 + i * 0.7, 0, 1.05), 0.26, 0.0, 0.55, glass("tier_u", 0.5), verts=3)
        sphere((-0.7 + i * 0.7, -0.05, 0.95), 0.08, (1, 1, 1), glow("moon", 1.8))


def winplate(tier_key, sparks):
    box((0, 0, 0.55), (3.6, 0.14, 0.28), metal("brass", 0.3))
    ribbon = glass("win", 0.75, 0.15)
    for i in range(7):
        t = i / 6
        x = -1.5 + 3.0 * t
        z = 1.15 + 0.45 * math.sin(math.pi * t)
        sphere((x, 0, z), 0.24 - 0.12 * abs(t - 0.5), (1, 0.7, 1), ribbon)
    sphere((0, 0, 1.62), 0.3, (1, 0.7, 1), glow(tier_key, 3.2))
    for k in range(sparks):
        a = k * 2 * math.pi / sparks
        sphere((1.15 * math.cos(a), -0.1, 1.15 + 0.62 * math.sin(a)), 0.05, (1, 1, 1),
               glow("win", 4.0))


def ui_buymenu():
    box((0, 0, 1.0), (4.2, 0.12, 2.9), matte("bg_deep", 0.85, 0.94))
    for i, key in enumerate(("tier_f", "tier_s", "tier_u")):
        x = -1.35 + i * 1.35
        box((x, -0.05, 1.0), (1.05, 0.1, 2.3), matte("bg_mid", 0.7, 0.96))
        cyl((x, -0.12, 1.55), 0.16, 0.55, glass(key, 0.55))
        sphere((x, -0.12, 1.4), 0.12, (1, 1, 0.8), glow(key, 2.2))
        box((x, -0.12, 0.15), (0.8, 0.08, 0.3), metal("brass", 0.35))


def vfx_shard():
    m = glass("violet", 0.6, 0.05)
    for gx in range(4):
        for gz in range(4):
            x = -1.2 + gx * 0.8
            z = -0.2 + gz * 0.8
            cone((x, 0, z), 0.16 + 0.04 * ((gx + gz) % 3), 0.0, 0.5 + 0.1 * ((gx * gz) % 4),
                 m, verts=3, rot=(0, 0, (gx * 4 + gz) * 0.7))


def vfx_essence():
    sphere((0, 0, 1.0), 0.4, (0.8, 0.8, 1.25), glow("orb", 6.0))
    sphere((0, 0, 0.55), 0.14, (0.7, 0.7, 1.4), glow("orb", 4.0))


def vfx_prism():
    for k in range(3):
        a = k * 2 * math.pi / 3
        cone((0.5 * math.cos(a), 0, 1.0 + 0.5 * math.sin(a)), 0.3, 0.0, 0.7,
             glass("tier_u", 0.5, 0.03), verts=3, rot=(0, 0, a))
    sphere((0, 0, 1.0), 0.16, (1, 1, 1), glow("moon", 6.0))


def vfx_mote():
    sphere((0, 0, 1.0), 0.22, (1, 1, 1), glow("candle", 5.0))


def vfx_petal():
    sphere((0, 0, 1.0), 0.5, (0.55, 0.14, 1.0), matte("violet", 0.5, 0.95))
    cone((0, 0, 0.45), 0.1, 0.0, 0.3, matte("bg_mid", 0.6))


# ---------------------------------------------------------------- registry
REG = {
    # key: (builder, out_relpath, res_x, res_y, ortho)
    "h1": (sym_h1, "symbols/h1.png", 1024, 1024, 3.4),
    "h2": (sym_h2, "symbols/h2.png", 1024, 1024, 3.4),
    "h3": (sym_h3, "symbols/h3.png", 1024, 1024, 3.4),
    "h4": (sym_h4, "symbols/h4.png", 1024, 1024, 3.4),
    "l1": (sym_l1, "symbols/l1.png", 1024, 1024, 3.4),
    "l2": (sym_l2, "symbols/l2.png", 1024, 1024, 3.4),
    "l3": (sym_l3, "symbols/l3.png", 1024, 1024, 3.4),
    "l4": (sym_l4, "symbols/l4.png", 1024, 1024, 3.4),
    "l5": (sym_l5, "symbols/l5.png", 1024, 1024, 3.4),
    "scatter": (sym_scatter, "symbols/scatter.png", 1024, 1024, 3.4),
    "mult": (sym_mult, "symbols/mult.png", 1024, 1024, 3.4),
    "mult_plate": (sym_mult_plate, "symbols/mult-plate.png", 1024, 1024, 3.4),
    "fx1": (sym_fx1, "symbols/fx1.png", 1024, 1024, 3.4),
    "frame_reel": (frame_reel, "frame/reel-cabinet.png", 1600, 1200, 5.2),
    "frame_cell": (lambda: frame_cell(False), "frame/cell.png", 512, 512, 3.6),
    "frame_cell_win": (lambda: frame_cell(True), "frame/cell-win.png", 512, 512, 3.6),
    "btn_spin": (ui_btn_spin, "ui/btn-spin-normal.png", 512, 512, 2.1),
    "btn_stop": (ui_btn_stop, "ui/btn-stop.png", 512, 512, 2.1),
    "btn_autoplay": (ui_btn_autoplay, "ui/btn-autoplay.png", 512, 512, 2.1),
    "btn_bet": (ui_btn_bet, "ui/btn-bet.png", 512, 512, 2.1),
    "btn_buy": (ui_btn_buy, "ui/btn-buy.png", 512, 512, 2.1),
    "btn_ante": (ui_btn_ante, "ui/btn-ante.png", 512, 512, 2.1),
    "btn_settings": (ui_btn_settings, "ui/btn-settings.png", 512, 512, 2.1),
    "ind_spinmode": (ui_ind_spinmode, "ui/ind-spinmode.png", 768, 384, 2.4),
    "panel_hud": (ui_panel_hud, "ui/panel-hud.png", 1536, 384, 5.0),
    "panel_overlay": (ui_panel_overlay, "ui/panel-overlay.png", 1024, 1024, 4.4),
    "hud_vial": (ui_hud_vial, "ui/hud-vial.png", 512, 1024, 2.6),
    "hud_dial": (ui_hud_dial, "ui/hud-dial.png", 512, 512, 2.0),
    "hud_prismrail": (ui_hud_prismrail, "ui/hud-prism-rail.png", 1024, 512, 3.2),
    "winplate_big": (lambda: winplate("win", 6), "winplates/big.png", 1024, 512, 4.6),
    "winplate_mega": (lambda: winplate("tier_f", 9), "winplates/mega.png", 1024, 512, 4.6),
    "winplate_epic": (lambda: winplate("tier_s", 12), "winplates/epic.png", 1024, 512, 4.6),
    "winplate_max": (lambda: winplate("tier_u", 16), "winplates/max.png", 1024, 512, 4.6),
    "buymenu": (ui_buymenu, "ui/buymenu.png", 1024, 768, 5.2),
    "vfx_shard": (vfx_shard, "vfx/shard-sheet.png", 1024, 1024, 4.2),
    "vfx_essence": (vfx_essence, "vfx/essence.png", 256, 256, 2.2),
    "vfx_prism": (vfx_prism, "vfx/prism-caustic.png", 512, 512, 3.0),
    "vfx_mote": (vfx_mote, "vfx/mote.png", 128, 128, 1.6),
    "vfx_petal": (vfx_petal, "vfx/petal.png", 256, 256, 2.4),
}


def main():
    root, only = cli_args()
    status = {}
    for key, (builder, rel, rx, ry, ortho) in REG.items():
        if only and key not in only:
            continue
        try:
            reset_scene()
            rig(rx, ry, ortho)
            builder()
            render_to(root / rel)
            status[key] = "ok"
            print(f"[kit] {key} -> {rel}")
        except Exception as e:  # noqa: BLE001
            status[key] = f"FAIL: {e}"
            print(f"[kit] {key} FAILED: {e}")
    print("KIT STATUS:", status)
    return status


if __name__ == "__main__":
    main()
