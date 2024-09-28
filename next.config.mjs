/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["@node-rs/argon2"]
    },
    eslint: {
        dirs: ['app']
    }
};

export default nextConfig;
