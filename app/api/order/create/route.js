import connectDB from '@/config/db';
import { inngest } from '@/config/inngest';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { address, items } = await request.json();

        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Address and items are required' }, { status: 400 });
        }

        await connectDB();

        const amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return await acc + product.offerPrice * item.quantity;
        }, 0);

        await inngest.send({
            name: 'order/create',
            data: {
                userId,
                address,
                items,
                amount: amount + Math.floor(amount * 0.02),
                date: Date.now()
            }
        });

        // Clear user cart
        const user = await User.findById(userId);
        user.cartItems = {};
        await user.save();

        return NextResponse.json({ success: true, message: 'Order placed' }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error.message);
        // Log the error to Inngest or any other logging service if needed
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}