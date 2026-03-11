import './src/env';

import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    unoptimized: true,
  },
  output: 'standalone',
};

export default config;
