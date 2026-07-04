import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Incubator @ University of Kentucky",
  description:
    "A weekly AI project studio at the University of Kentucky where students, faculty, staff, researchers, and builders turn ideas into prototypes, studies, grants, and publications.",
};

// Inline script: apply persisted theme/accent/density BEFORE first paint to avoid flash.
const themeInitScript = `(function(){
  try {
    var raw = localStorage.getItem('aiincubator.settings.v2');
    var s = raw ? JSON.parse(raw) : null;
    var theme   = (s && s.theme)   || 'dark';
    var accent  = (s && s.accent)  || 'blue';
    var density = (s && s.density) || 'default';
    var r = document.documentElement;
    r.setAttribute('data-theme', theme);
    r.setAttribute('data-accent', accent);
    r.setAttribute('data-density', density);
  } catch(e) {}
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" data-accent="blue" data-density="default">
      <head>
        <link rel="icon" type="image/png" href="/logo-mark.png" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
