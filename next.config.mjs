/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @resvg/resvg-js has a native .node binary — keep it out of the webpack
  // bundle and require it at runtime instead.
  experimental: {
    serverComponentsExternalPackages: ["@resvg/resvg-js"],
    // The render route reads bundled .ttf files at runtime; make sure Vercel's
    // file tracing ships them (and the resvg binary) into the serverless function.
    outputFileTracingIncludes: {
      "/api/render": ["./lib/render/fonts/**", "./node_modules/@resvg/**"],
    },
  },
};

export default nextConfig;
