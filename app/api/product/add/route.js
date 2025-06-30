import connectDB from '@/config/db';
import authSeller from '@/lib/authSeller';
import Product from '@/models/Product';
import { getAuth } from '@clerk/nextjs/server';
import ImageKit from 'imagekit';
import { NextResponse } from 'next/server';

// Configure ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        await connectDB();

        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const offerPrice = formData.get('offerPrice');


        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: 'No files uploaded' }, { status: 400 });
        }

        const result = await Promise.all(
            files.map(async (file, index) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // Generate unique filename
                const fileName = `product_${Date.now()}_${index}_${file.name}`;
                
                try {
                    // Subir imagen con optimización automática de ImageKit
                    const uploadResponse = await imagekit.upload({
                        file: buffer,
                        fileName: fileName,
                        folder: '/product',
                        useUniqueFileName: true,
                        tags: ['product', category],
                        isPrivateFile: false,
                    });
                    
                    return uploadResponse;
                } catch (error) {
                    console.error('ImageKit upload error:', error);
                    throw error;
                }
            })
        );

        const images = result.map(result => result.url);

        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            images,
            date: Date.now()
        });

        return NextResponse.json({ success: true, message: 'Uploaded successfully', newProduct }, { status: 201 });

    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}