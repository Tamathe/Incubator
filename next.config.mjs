/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/ideas", destination: "/#fridays", permanent: true },
      { source: "/built", destination: "/projects", permanent: true },
      { source: "/outcomes", destination: "/projects", permanent: true },
      { source: "/open-problems", destination: "/projects", permanent: true },
      { source: "/changelog", destination: "/projects", permanent: true },
    ];
  },
};

export default nextConfig;
