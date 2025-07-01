import connectDB from '@/config/db';
import Order from '@/models/Order';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        await connectDB();
        
        // Find all orders for the user that are either COD or paid Stripe orders, including address and product details
        const orders = await Order.find({userId, $or: [{ paymentType: 'COD' }, { paymentType: 'Stripe', isPaid: true}]}).populate('address items.product');

        return NextResponse.json({ success: true, orders }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}