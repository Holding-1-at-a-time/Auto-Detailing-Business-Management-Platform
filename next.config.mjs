/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 00:17:04
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
/**
 * Next.js configuration
 */
/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration for Next.js.
 *
 * @param {import('next').NextConfig} config - The Next.js configuration.
 * @returns {import('next').NextConfig} The modified Next.js configuration.
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['placeholder.com'],
    unoptimized: true,
  },
  webpack: (config) => {
    // Optionally customize webpack config here
    return config;
  },
};

export default nextConfig;