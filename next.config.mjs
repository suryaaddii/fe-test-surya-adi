/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/_api/:path*",
        destination: "https://test-fe.mysellerpintar.com/api/:path*",
      },
      {
        source: "/_upload/:path*",
        destination: "https://test-fe.mysellerpintar.com/upload/:path*",
      },
    ];
  },
};
export default nextConfig;
