/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable large file uploads
    serverComponentsExternalPackages: ["cloudinary"],
  },
  // For App Router, we need to configure this differently
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
