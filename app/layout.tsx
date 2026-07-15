import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiincubator-uky.vercel.app",
  ),
  title: "AI Incubator @ UK | Fridays at Noon",
  description:
    "Students, faculty, and staff from across UK meet every Friday at noon to share what they are learning about AI, try ideas, and work on projects together.",
  openGraph: {
    title: "The AI Incubator at UK",
    description:
      "Students, faculty, and staff from across UK meet every Friday at noon to share what they are learning about AI, try ideas, and work on projects together.",
    type: "website",
    siteName: "AI Incubator @ University of Kentucky",
    images: [
      {
        url: "/media/incubator-commercial-poster.jpg",
        width: 1920,
        height: 1080,
        alt: "AI Incubator members at a University of Kentucky showcase above the Incubator logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The AI Incubator at UK",
    description:
      "Students, faculty, and staff from across UK meet every Friday at noon to share what they are learning about AI, try ideas, and work on projects together.",
    images: ["/media/incubator-commercial-poster.jpg"],
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
