/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle (.next/standalone) so the Docker image
  // for Cloud Run stays small and doesn't need node_modules at runtime.
  output: "standalone",
};

export default nextConfig;
