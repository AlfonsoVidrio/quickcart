/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
            // {
            //     protocol: 'https',
            //     hostname: 'ik.imagekit.io',
            //     pathname: '**',
            // },
        ],
    },
};

export default nextConfig;
