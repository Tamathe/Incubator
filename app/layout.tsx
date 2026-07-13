import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiincubator-uky.vercel.app",
  ),
  title: "AI Incubator @ UK | Learn AI Together",
  description:
    "An open Friday community where University of Kentucky students, faculty, and staff learn AI together across disciplines.",
  openGraph: {
    title: "Learn to work with AI, together at UK.",
    description:
      "Every Friday at noon, students, faculty, and staff from across campus gather to solve problems and learn to use AI.",
    type: "website",
    siteName: "AI Incubator @ University of Kentucky",
    images: [
      {
        url: "/media/incubator-primary.jpg",
        width: 2400,
        height: 1600,
        alt: "University of Kentucky AI Incubator members gathered at a campus showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn to work with AI, together at UK.",
    description:
      "Every Friday at noon, students, faculty, and staff from across campus gather to solve problems and learn to use AI.",
    images: ["/media/incubator-primary.jpg"],
  },
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
