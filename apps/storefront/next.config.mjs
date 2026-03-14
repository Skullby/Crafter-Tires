/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@crafter/database", "@crafter/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
