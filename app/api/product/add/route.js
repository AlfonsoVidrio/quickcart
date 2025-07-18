import connectDB from '@/config/db';
import authSeller from '@/lib/authSeller';
import Product from '@/models/Product';
import { getAuth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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
        const stock = formData.get('stock');

        // Validate stock is a positive integer
        const stockNumber = Number(stock);
        if (!Number.isInteger(stockNumber) || stockNumber < 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'Stock must be a non-negative whole number' 
            }, { status: 400 });
        }

        // Validate price is a positive number
        const priceNumber = Number(price);
        if (priceNumber <= 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'Price must be a positive number' 
            }, { status: 400 });
        }

        // Validate offer price if provided
        let offerPriceNumber = null;
        if (offerPrice && offerPrice.trim() !== '') {
            offerPriceNumber = Number(offerPrice);
            if (offerPriceNumber <= 0) {
                return NextResponse.json({ 
                    success: false, 
                    message: 'Offer price must be a positive number' 
                }, { status: 400 });
            }
            if (offerPriceNumber > priceNumber) {
                return NextResponse.json({ 
                    success: false, 
                    message: 'Offer price cannot be greater than regular price' 
                }, { status: 400 });
            }
        }


        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: 'No files uploaded' }, { status: 400 });
        }

        const result = await Promise.all(
            files.map( async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { 
                            resource_type: 'auto',
                            folder: 'product'
                        },
                        ( error, result ) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                    stream.end(buffer);
                });
            })
        );

        const images = result.map(result => result.secure_url);

        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: priceNumber,
            offerPrice: offerPriceNumber,
            stock: stockNumber,
            images,
            date: Date.now()
        });

        return NextResponse.json({ success: true, message: 'Uploaded successfully', newProduct }, { status: 201 });

    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}