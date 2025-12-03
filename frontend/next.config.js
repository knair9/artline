/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.metmuseum.org',
          port: '',
          pathname: '/CRDImages/**',
        },
        // Cleveland Museum
        {
          protocol: 'https',
          hostname: 'openaccess-cdn.clevelandart.org',
          port: '',
          pathname: '/**',
        },
        // MoMA
        {
          protocol: 'https',
          hostname: 'www.moma.org',
          port: '',
          pathname: '/media/**',
        },
      ],
    },
  };
  
  module.exports = nextConfig;
  