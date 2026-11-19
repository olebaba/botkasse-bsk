const erUtvikling = process.env.NODE_ENV !== 'production'

const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${erUtvikling ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://5bxxn0af98q9ysmf.public.blob.vercel-storage.com",
    "font-src 'self'",
    `connect-src 'self'${erUtvikling ? ' ws:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join('; ')

const sikkerhetsheadere = [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['@node-rs/argon2'],
    async headers() {
        return [{ source: '/:path*', headers: sikkerhetsheadere }]
    },
}

export default nextConfig
