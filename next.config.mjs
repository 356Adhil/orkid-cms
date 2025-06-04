/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: false, // Remove size limit for uploads
    },
  },
  experimental: {
    // Enable large file uploads
    serverComponentsExternalPackages: ["cloudinary"],
  },
};

export default nextConfig;
