import connectDB from '@/config/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        const products = await Product.find({});
        return NextResponse.json({ success: true, products }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}