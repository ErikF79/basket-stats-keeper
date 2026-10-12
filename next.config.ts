import type {NextConfig} from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || '';

const nextConfig: NextConfig = {
  // Static export so the app can be hosted on GitHub Pages.
  output: 'export',
  // When hosted on a GitHub Pages project site, set NEXT_PUBLIC_BASE_PATH=/<repo-name>.
  basePath: basePath || undefined,
  // Emit /path/index.html style routes, which GitHub Pages serves reliably.
  trailingSlash: true,
  images: {
    // next/image optimization is not available on a static export.
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
