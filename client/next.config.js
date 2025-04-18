/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [], // Empty array means no directories will be linted
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Also ignore TypeScript errors during build
  },
  images: { unoptimized: true },
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Access-Control-Allow-Origin',
  //           value: 'http://localhost:3000',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Methods',
  //           value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Headers',
  //           value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;