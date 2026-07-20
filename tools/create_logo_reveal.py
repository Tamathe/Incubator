"""Render a cinematic AI Incubator logo reveal from the approved raster mark.

The animation is deterministic, uses the supplied logo pixels unchanged, and
builds all motion, particles, glow, typography, and sound locally.
"""

from __future__ import annotations

import argparse
import math
import shutil
import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 6.0
FRAMES = int(FPS * DURATION)
BLUE = (24, 82, 255)
UK_BLUE = (0, 51, 160)
GREEN = (113, 201, 28)


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge0 == edge1:
        return float(value >= edge1)
    x = clamp01((value - edge0) / (edge1 - edge0))
    return x * x * (3.0 - 2.0 * x)


def ease_out_back(x: float) -> float:
    x = clamp01(x)
    c1 = 1.70158
    c3 = c1 + 1.0
    return 1.0 + c3 * (x - 1.0) ** 3 + c1 * (x - 1.0) ** 2


def rgba_solid(size: tuple[int, int], color: tuple[int, int, int], alpha: Image.Image) -> Image.Image:
    layer = Image.new("RGBA", size, (*color, 0))
    layer.putalpha(alpha)
    return layer


def prepare_logo(path: Path, target_width: int = 1640) -> tuple[Image.Image, Image.Image]:
    """Extract the colored/white mark from its charcoal raster background."""
    source = Image.open(path).convert("RGB")
    rgb = np.asarray(source, dtype=np.float32)
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    chroma = mx - mn
    luminance = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)

    # Saturated blue/green faces plus bright white outlines. Dark charcoal and
    # the baked background texture fall away without redrawing the logo.
    color_alpha = np.clip((chroma - 17.0) / 60.0, 0.0, 1.0) * np.clip((mx - 38.0) / 55.0, 0.0, 1.0)
    white_alpha = np.clip((luminance - 62.0) / 92.0, 0.0, 1.0)
    alpha = np.maximum(color_alpha, white_alpha)
    alpha = np.clip(alpha ** 0.72, 0.0, 1.0)

    # Suppress isolated charcoal noise while retaining antialiased mark edges.
    alpha_img = Image.fromarray(np.uint8(alpha * 255), "L").filter(ImageFilter.MedianFilter(3))
    bbox = alpha_img.getbbox()
    if bbox is None:
        raise RuntimeError("Could not isolate the logo from its source image")
    pad = 8
    bbox = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(source.width, bbox[2] + pad),
        min(source.height, bbox[3] + pad),
    )
    source = source.crop(bbox)
    alpha_img = alpha_img.crop(bbox)

    target_height = round(source.height * target_width / source.width)
    source = source.resize((target_width, target_height), Image.Resampling.LANCZOS)
    alpha_img = alpha_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    rgba = source.convert("RGBA")
    rgba.putalpha(alpha_img)

    pixels = np.asarray(source, dtype=np.int16)
    green_mask = np.clip(
        (pixels[:, :, 1] - pixels[:, :, 0] - 10) / 80.0,
        0.0,
        1.0,
    ) * np.asarray(alpha_img, dtype=np.float32) / 255.0
    return rgba, Image.fromarray(np.uint8(green_mask * 255), "L")


def make_background_fields() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    y, x = np.mgrid[0:HEIGHT, 0:WIDTH]
    xn = (x - WIDTH * 0.5) / WIDTH
    yn = (y - HEIGHT * 0.48) / HEIGHT
    radius = np.sqrt(xn * xn + yn * yn)
    center_glow = np.exp(-(radius / 0.40) ** 2)
    blue_glow = np.exp(-(((xn + 0.22) / 0.42) ** 2 + ((yn + 0.02) / 0.44) ** 2))
    green_glow = np.exp(-(((xn - 0.18) / 0.30) ** 2 + ((yn - 0.01) / 0.34) ** 2))
    vignette = np.clip(1.0 - (radius / 0.71) ** 1.75, 0.05, 1.0)
    return center_glow, blue_glow, green_glow, vignette


def make_particles(seed: int = 20260714) -> list[dict[str, float]]:
    rng = np.random.default_rng(seed)
    particles: list[dict[str, float]] = []
    for index in range(68):
        particles.append(
            {
                "x": float(rng.uniform(0.03, 0.97) * WIDTH),
                "y": float(rng.uniform(0.06, 0.94) * HEIGHT),
                "speed": float(rng.uniform(8.0, 28.0)),
                "phase": float(rng.uniform(0.0, math.tau)),
                "size": float(rng.uniform(1.0, 3.2)),
                "green": float(rng.random() > 0.82),
                "depth": float(rng.uniform(0.4, 1.0)),
                "index": float(index),
            }
        )
    return particles


def draw_background(
    t: float,
    fields: tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray],
    particles: list[dict[str, float]],
) -> Image.Image:
    center, blue, green, vignette = fields
    pulse = 0.82 + 0.18 * math.sin(t * 1.7)
    rgb = np.zeros((HEIGHT, WIDTH, 3), dtype=np.float32)
    rgb[:, :, 0] = 1.8 + center * 2.8
    rgb[:, :, 1] = 4.0 + center * 8.5 + blue * 3.0 + green * 2.8
    rgb[:, :, 2] = 8.0 + center * 18.0 * pulse + blue * 20.0 + green * 1.5
    rgb *= vignette[:, :, None]
    canvas = Image.fromarray(np.uint8(np.clip(rgb, 0, 255)), "RGB").convert("RGBA")

    network = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(network, "RGBA")

    # A faint perspective data plane gives the background scale without reading
    # as a stock circuit-board effect.
    grid_alpha = int(10 + 5 * math.sin(t * 0.9) ** 2)
    horizon = 570
    for step in range(1, 11):
        frac = step / 11.0
        y = round(horizon + (frac**1.75) * (HEIGHT - horizon))
        draw.line((0, y, WIDTH, y), fill=(30, 84, 190, grid_alpha), width=1)
    vanishing_x = WIDTH // 2
    for x_bottom in range(-200, WIDTH + 201, 160):
        draw.line((vanishing_x, horizon, x_bottom, HEIGHT), fill=(24, 74, 170, grid_alpha), width=1)

    positions: list[tuple[float, float, dict[str, float]]] = []
    for p in particles:
        drift = t * p["speed"]
        px = p["x"] + math.sin(t * 0.47 + p["phase"]) * 22.0 * p["depth"]
        py = (p["y"] - drift + HEIGHT * 1.2) % (HEIGHT * 1.2) - HEIGHT * 0.1
        # During assembly, nodes are gently drawn toward the mark's center.
        convergence = smoothstep(0.18, 1.48, t) * (1.0 - smoothstep(1.55, 2.55, t))
        strength = convergence * (0.10 + 0.08 * math.sin(p["phase"] + t * 2.0))
        px += (WIDTH * 0.5 - px) * strength
        py += (HEIGHT * 0.5 - py) * strength
        positions.append((px, py, p))

    network_strength = 0.35 + 0.65 * smoothstep(0.0, 0.7, t)
    for i, (x1, y1, p1) in enumerate(positions):
        for x2, y2, _ in positions[i + 1 :]:
            dx = x1 - x2
            dy = y1 - y2
            dist = math.sqrt(dx * dx + dy * dy)
            if dist < 165:
                alpha = int((1.0 - dist / 165.0) * 38 * network_strength * p1["depth"])
                draw.line((x1, y1, x2, y2), fill=(30, 92, 228, alpha), width=1)

    for px, py, p in positions:
        size = p["size"] * (0.85 + 0.25 * math.sin(t * 2.2 + p["phase"]))
        color = GREEN if p["green"] else (70, 138, 255)
        alpha = int(65 + 100 * p["depth"])
        draw.ellipse((px - size, py - size, px + size, py + size), fill=(*color, alpha))
        if p["size"] > 2.35:
            draw.ellipse((px - size * 3, py - size * 3, px + size * 3, py + size * 3), outline=(*color, 35), width=1)

    network = network.filter(ImageFilter.GaussianBlur(0.35))
    return Image.alpha_composite(canvas, network)


def animated_logo(
    t: float,
    logo: Image.Image,
    green_mask: Image.Image,
    stripe_offsets: np.ndarray,
    stripe_delays: np.ndarray,
) -> Image.Image:
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    reveal_global = smoothstep(0.45, 1.62, t)
    if reveal_global <= 0.0:
        return layer

    settle = ease_out_back(smoothstep(0.52, 1.80, t))
    scale = 0.945 + 0.055 * settle
    lw = max(1, round(logo.width * scale))
    lh = max(1, round(logo.height * scale))
    working = logo.resize((lw, lh), Image.Resampling.LANCZOS)
    working_green = green_mask.resize((lw, lh), Image.Resampling.LANCZOS)
    base_x = (WIDTH - lw) // 2
    base_y = (HEIGHT - lh) // 2 - 25

    assembled = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    stripe_h = 14
    for stripe_idx, top in enumerate(range(0, lh, stripe_h)):
        bottom = min(lh, top + stripe_h)
        delay = float(stripe_delays[stripe_idx % len(stripe_delays)])
        progress = smoothstep(0.50 + delay, 1.50 + delay, t)
        if progress <= 0.0:
            continue
        offset = round(float(stripe_offsets[stripe_idx % len(stripe_offsets)]) * (1.0 - progress) ** 2)
        fragment = working.crop((0, top, lw, bottom))
        if progress < 0.985:
            fragment_alpha = fragment.getchannel("A").point(lambda value, p=progress: int(value * p))
            fragment.putalpha(fragment_alpha)
        assembled.alpha_composite(fragment, (base_x + offset, base_y + top))

        # Brief blue/green chromatic ghosts make the glitch feel optical rather
        # than like a damaged TV signal.
        ghost_strength = (1.0 - progress) * reveal_global
        if ghost_strength > 0.025:
            ghost_alpha = fragment.getchannel("A").point(lambda value, g=ghost_strength: int(value * g * 0.58))
            ghost_blue = rgba_solid(fragment.size, (20, 78, 255), ghost_alpha)
            assembled.alpha_composite(ghost_blue, (base_x + offset + 10, base_y + top))
            ghost_green = rgba_solid(fragment.size, GREEN, ghost_alpha.point(lambda value: int(value * 0.52)))
            assembled.alpha_composite(ghost_green, (base_x + offset - 7, base_y + top))

    alpha = assembled.getchannel("A")
    glow_alpha = alpha.filter(ImageFilter.GaussianBlur(26)).point(lambda value: int(value * (0.42 + 0.18 * reveal_global)))
    layer = Image.alpha_composite(layer, rgba_solid((WIDTH, HEIGHT), UK_BLUE, glow_alpha))

    # Green @ pulse: this is the visual ignition point of the reveal.
    gm = Image.new("L", (WIDTH, HEIGHT), 0)
    gm.paste(working_green, (base_x, base_y))
    ignition = math.exp(-((t - 1.48) / 0.27) ** 2)
    steady = 0.22 + 0.08 * math.sin(t * 2.7)
    green_glow_alpha = gm.filter(ImageFilter.GaussianBlur(34)).point(
        lambda value: int(value * min(1.0, steady + ignition * 1.2))
    )
    layer = Image.alpha_composite(layer, rgba_solid((WIDTH, HEIGHT), GREEN, green_glow_alpha))

    # Light sweeps are clipped to the real logo alpha.
    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    sweep_strength = np.zeros((HEIGHT, WIDTH), dtype=np.float32)
    for center_t, width_t, gain in ((2.18, 0.68, 0.78), (4.12, 0.82, 0.42)):
        local = (t - center_t) / width_t
        if -0.15 <= local <= 1.15:
            cx = -240 + local * (WIDTH + 480)
            diagonal = xx + yy * 0.22
            sweep_strength += np.exp(-((diagonal - cx) / 76.0) ** 2) * gain
    sweep_alpha = np.asarray(alpha, dtype=np.float32) / 255.0 * np.clip(sweep_strength, 0.0, 1.0)
    sweep = Image.fromarray(np.uint8(sweep_alpha * 210), "L")
    layer = Image.alpha_composite(layer, assembled)
    layer = Image.alpha_composite(layer, rgba_solid((WIDTH, HEIGHT), (224, 239, 255), sweep))

    # A precise scanning line completes the materialization.
    scan_progress = smoothstep(0.56, 1.62, t)
    if scan_progress < 1.0:
        scan_x = round(-80 + scan_progress * (WIDTH + 160))
        scan = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        scan_draw = ImageDraw.Draw(scan, "RGBA")
        scan_draw.rectangle((scan_x - 2, 125, scan_x + 2, 885), fill=(210, 232, 255, 210))
        scan_draw.rectangle((scan_x - 18, 125, scan_x + 18, 885), fill=(30, 94, 255, 40))
        layer = Image.alpha_composite(layer, scan.filter(ImageFilter.GaussianBlur(2.0)))
    return layer


def draw_centered_tracking_text(
    layer: Image.Image,
    text: str,
    font: ImageFont.FreeTypeFont,
    y: int,
    tracking: int,
    fill: tuple[int, int, int, int],
) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    widths = [draw.textlength(character, font=font) for character in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = (WIDTH - total) / 2.0
    for character, char_width in zip(text, widths):
        draw.text((x, y), character, font=font, fill=fill, anchor="la")
        x += char_width + tracking


def add_foreground(frame: Image.Image, t: float, font: ImageFont.FreeTypeFont) -> Image.Image:
    overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    # Fine particles crossing the lens add depth but never cover the wordmark.
    for index in range(22):
        phase = (index * 0.61803398875) % 1.0
        x = ((phase + t * (0.018 + index * 0.0007)) % 1.15 - 0.08) * WIDTH
        y = (0.11 + ((index * 0.371) % 0.78)) * HEIGHT
        radius = 0.7 + (index % 4) * 0.45
        alpha = 25 + (index % 5) * 11
        color = GREEN if index % 9 == 0 else (95, 150, 255)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))

    # Energy flare on the @ at the exact moment the logo locks together.
    flare = math.exp(-((t - 1.52) / 0.16) ** 2)
    if flare > 0.01:
        fx, fy = 800, 465
        length = 170 + 260 * flare
        alpha = int(180 * flare)
        draw.line((fx - length, fy, fx + length, fy), fill=(220, 244, 255, alpha), width=2)
        draw.line((fx, fy - length * 0.28, fx, fy + length * 0.28), fill=(170, 255, 110, alpha), width=2)
        draw.ellipse((fx - 10, fy - 10, fx + 10, fy + 10), fill=(240, 255, 225, alpha))

    text_alpha = smoothstep(2.82, 3.48, t) * (1.0 - smoothstep(5.12, 5.52, t))
    if text_alpha > 0.0:
        line_width = int(520 * smoothstep(2.75, 3.28, t))
        line_alpha = int(105 * text_alpha)
        draw.line(
            (WIDTH // 2 - line_width // 2, 925, WIDTH // 2 + line_width // 2, 925),
            fill=(42, 103, 255, line_alpha),
            width=2,
        )
        draw_centered_tracking_text(
            overlay,
            "LEARN  •  BUILD  •  SOLVE  •  TOGETHER",
            font,
            952,
            5,
            (224, 233, 249, int(225 * text_alpha)),
        )

    overlay = overlay.filter(ImageFilter.GaussianBlur(0.22))
    return Image.alpha_composite(frame, overlay)


def synthesize_audio(path: Path) -> None:
    sample_rate = 48_000
    count = int(DURATION * sample_rate)
    timeline = np.arange(count, dtype=np.float64) / sample_rate
    rng = np.random.default_rng(9147)
    left = np.zeros(count, dtype=np.float64)
    right = np.zeros(count, dtype=np.float64)

    # Low room tone and rising fundamental.
    bed_env = np.sin(np.pi * np.clip(timeline / 5.7, 0.0, 1.0)) ** 1.4
    phase = 2.0 * np.pi * (39.0 * timeline + 2.2 * timeline**2)
    sub_bed = np.sin(phase) * bed_env * 0.075
    left += sub_bed
    right += sub_bed

    # A filtered-noise-like riser built from differentiated deterministic noise.
    noise = rng.normal(0.0, 1.0, count)
    smooth = np.convolve(noise, np.ones(47) / 47.0, mode="same")
    airy = noise - smooth
    riser_env = smoothstep_array(0.18, 1.48, timeline) * (1.0 - smoothstep_array(1.47, 1.70, timeline))
    riser = airy * riser_env * (0.015 + 0.065 * smoothstep_array(0.22, 1.48, timeline))
    left += riser * 0.85
    right += np.roll(riser, 183) * 0.85

    # Digital tonal ascent into the lock point.
    chirp_t = np.clip(timeline - 0.42, 0.0, 1.18)
    chirp_phase = 2.0 * np.pi * (180.0 * chirp_t + 560.0 * chirp_t**2)
    chirp_env = smoothstep_array(0.42, 0.64, timeline) * (1.0 - smoothstep_array(1.42, 1.65, timeline))
    chirp = np.sin(chirp_phase) * chirp_env * 0.085
    left += chirp * 0.8
    right += chirp

    # Cinematic impact: clean sub drop, short body, and a restrained transient.
    impact_time = timeline - 1.52
    active = impact_time >= 0.0
    impact = np.zeros_like(timeline)
    impact[active] = (
        np.sin(2.0 * np.pi * (61.0 * impact_time[active] - 6.4 * impact_time[active] ** 2))
        * np.exp(-impact_time[active] * 3.2)
        * 0.42
    )
    body = np.zeros_like(timeline)
    body[active] = np.sin(2.0 * np.pi * 126.0 * impact_time[active]) * np.exp(-impact_time[active] * 8.0) * 0.13
    transient = np.zeros_like(timeline)
    transient[active] = rng.normal(0.0, 1.0, active.sum()) * np.exp(-impact_time[active] * 35.0) * 0.10
    left += impact + body + transient
    right += impact + body - transient * 0.35

    # Two glassy light-sweep accents.
    for when, gain, pan in ((2.24, 0.09, -0.18), (4.18, 0.055, 0.24)):
        accent_t = timeline - when
        accent_active = accent_t >= 0.0
        accent = np.zeros_like(timeline)
        envelope = np.exp(-accent_t[accent_active] * 5.2)
        accent[accent_active] = (
            np.sin(2 * np.pi * 1540 * accent_t[accent_active])
            + 0.55 * np.sin(2 * np.pi * 2310 * accent_t[accent_active])
        ) * envelope * gain
        left += accent * (1.0 - pan)
        right += accent * (1.0 + pan)

    fade = 1.0 - smoothstep_array(5.30, 5.92, timeline)
    left *= fade
    right *= fade
    stereo = np.column_stack((left, right))
    peak = np.max(np.abs(stereo))
    if peak > 0:
        stereo *= 0.91 / peak
    pcm = np.int16(np.clip(stereo, -1.0, 1.0) * 32767)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm.tobytes())


def smoothstep_array(edge0: float, edge1: float, values: np.ndarray) -> np.ndarray:
    x = np.clip((values - edge0) / (edge1 - edge0), 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def render(source: Path, output_dir: Path) -> None:
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required but was not found on PATH")
    output_dir.mkdir(parents=True, exist_ok=True)
    frames_dir = output_dir / "logo-reveal-frames"
    frames_dir.mkdir(exist_ok=True)

    silent_path = output_dir / "incubator-logo-reveal-silent.mp4"
    audio_path = output_dir / "incubator-logo-reveal-sound-design.wav"
    final_path = output_dir / "incubator-logo-reveal.mp4"
    preview_path = output_dir / "incubator-logo-reveal-preview.gif"
    poster_path = output_dir / "incubator-logo-reveal-poster.jpg"

    logo, green_mask = prepare_logo(source)
    fields = make_background_fields()
    particles = make_particles()
    rng = np.random.default_rng(427)
    stripe_count = math.ceil(logo.height / 14) + 8
    stripe_offsets = rng.integers(-230, 231, size=stripe_count)
    stripe_delays = rng.uniform(-0.12, 0.18, size=stripe_count)
    font = ImageFont.truetype(r"C:\Windows\Fonts\seguisb.ttf", 27)

    command = [
        "ffmpeg",
        "-y",
        "-v",
        "error",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "14",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(silent_path),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    if process.stdin is None:
        raise RuntimeError("Could not open ffmpeg input pipe")

    preview_frames = {15: "01-awaken", 36: "02-assemble", 51: "03-lock", 96: "04-message", 150: "05-hold"}
    try:
        for frame_index in range(FRAMES):
            t = frame_index / FPS
            frame = draw_background(t, fields, particles)
            logo_layer = animated_logo(t, logo, green_mask, stripe_offsets, stripe_delays)
            frame = Image.alpha_composite(frame, logo_layer)
            frame = add_foreground(frame, t, font)

            # Clean editorial fade on both ends.
            fade_in = smoothstep(0.00, 0.30, t)
            fade_out = 1.0 - smoothstep(5.42, 5.98, t)
            exposure = fade_in * fade_out
            if exposure < 0.999:
                black = Image.new("RGBA", frame.size, (0, 0, 0, int(255 * (1.0 - exposure))))
                frame = Image.alpha_composite(frame, black)

            rgb = frame.convert("RGB")
            process.stdin.write(np.asarray(rgb, dtype=np.uint8).tobytes())
            if frame_index in preview_frames:
                rgb.save(frames_dir / f"{preview_frames[frame_index]}.jpg", quality=94, subsampling=0)
            if frame_index == 105:
                rgb.save(poster_path, quality=96, subsampling=0)
    finally:
        process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError("ffmpeg failed while encoding the silent video")

    synthesize_audio(audio_path)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            str(silent_path),
            "-i",
            str(audio_path),
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "256k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(final_path),
        ],
        check=True,
    )
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            str(final_path),
            "-vf",
            "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4",
            "-loop",
            "0",
            str(preview_path),
        ],
        check=True,
    )

    print(final_path)
    print(silent_path)
    print(audio_path)
    print(preview_path)
    print(poster_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    render(args.source.resolve(), args.output_dir.resolve())


if __name__ == "__main__":
    main()
