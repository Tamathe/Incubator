"use client";

import { useEffect, useRef } from "react";

/**
 * Animated dot-grid background. Renders an inline SVG into the container,
 * runs a slow sine ripple + mouse-parallax bump (radius 120px) via rAF.
 *
 * Mounted positioned absolutely inside a relatively-positioned section.
 */
export default function DotGrid() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    let raf = 0;

    function buildAndAnimate() {
      if (!grid) return;
      const SPACING = 24;
      const w = grid.clientWidth;
      const h = grid.clientHeight;
      if (!w || !h) return;
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("xmlns", ns);
      svg.setAttribute("viewBox", `0 0 ${cols * SPACING} ${rows * SPACING}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMid slice");

      const dots: { el: SVGCircleElement; x: number; y: number }[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = document.createElementNS(ns, "circle");
          c.setAttribute("cx", String(x * SPACING + SPACING / 2));
          c.setAttribute("cy", String(y * SPACING + SPACING / 2));
          c.setAttribute("r", "1");
          svg.appendChild(c);
          dots.push({
            el: c,
            x: x * SPACING + SPACING / 2,
            y: y * SPACING + SPACING / 2,
          });
        }
      }
      grid.innerHTML = "";
      grid.appendChild(svg);

      const parent = grid.parentElement;
      const mouse = { x: w / 2, y: h / 2 };
      let active = false;

      const onMove = (e: MouseEvent) => {
        const rect = grid.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) * ((cols * SPACING) / rect.width);
        mouse.y = (e.clientY - rect.top) * ((rows * SPACING) / rect.height);
        active = true;
      };
      const onLeave = () => {
        active = false;
      };
      parent?.addEventListener("mousemove", onMove);
      parent?.addEventListener("mouseleave", onLeave);

      const t0 = performance.now();
      function frame(t: number) {
        const elapsed = (t - t0) / 1000;
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          const wave =
            Math.sin((d.x + d.y) * 0.012 + elapsed * 0.6) * 0.5 + 0.5;
          let r = 0.5 + wave * 0.6;
          if (active) {
            const dx = d.x - mouse.x;
            const dy = d.y - mouse.y;
            const dist2 = dx * dx + dy * dy;
            const radius = 120 * 120;
            if (dist2 < radius) {
              const k = 1 - dist2 / radius;
              r += k * 2.0;
            }
          }
          d.el.setAttribute("r", r.toFixed(2));
        }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        parent?.removeEventListener("mousemove", onMove);
        parent?.removeEventListener("mouseleave", onLeave);
      };
    }

    const cleanup = buildAndAnimate();
    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, []);

  return <div className="dotgrid" ref={ref} aria-hidden="true" />;
}
