import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bækkelaget bøter',
        short_name: 'BSK',
        description: 'Side med oversikt over bøter i bækkelaget SK',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}