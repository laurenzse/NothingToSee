/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Force video.js to use CommonJS version
    config.resolve.alias = {
      ...config.resolve.alias,
      'video.js': 'video.js/dist/video.cjs.js',
    };

    return config;
  },
}

module.exports = nextConfig
