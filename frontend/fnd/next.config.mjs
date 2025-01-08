/** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       remotePatterns: [
//         {
//           protocol: 'https',
//           hostname: 'picsum.photos',
//           port: '',
//           pathname: '/**',
//         },
//       ],
//     },
//   }

const nextConfig = {
    images: {
      unoptimized: true,
    },
  };

export default nextConfig;