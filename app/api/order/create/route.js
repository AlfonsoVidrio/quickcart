import connectDB from '@/config/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';
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

        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return await acc + product.offerPrice * item.quantity;
        }, 0);

        amount += Math.floor(amount * 0.036);

        const newOrder = await Order.create({
            userId,
            address,
            items,
            amount,
            date: Date.now(),
            paymentType: 'COD',
            status: 'pending'
        });

        // Clear user cart
        const user = await User.findById(userId);
        user.cartItems = {};
        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Order placed successfully',
            orderId: newOrder._id 
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error.message);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}