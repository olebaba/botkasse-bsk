/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["@node-rs/argon2"],
    eslint: {
        dirs: ['app']
    },
};

export default nextConfig;
