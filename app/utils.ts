export const baseUrl = () => {
    if (process.env.NODE_ENV === 'production'){
        return 'https://' + process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    }
    return 'http://' + process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
}
