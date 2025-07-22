import connectDB from '@/config/db';
import Order from '@/models/Order';
import Address from '@/models/Address';
import Product from '@/models/Product';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        // Check if user is authenticated
        if (!userId) {
            return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
        }

        // Connect to database with retry logic
        await connectDB();
        
        // Find all orders for the user that are either COD or paid Stripe orders, including address and product details
        const orders = await Order.find({
            userId, 
            $or: [
                { paymentType: 'COD' }, 
                { paymentType: 'Stripe', isPaid: true }
            ]
        }).populate('address items.product').lean();

        return NextResponse.json({ success: true, orders }, { status: 200 });
    } catch (error) {
        console.error('Error fetching orders:', error);
        
        // Handle specific MongoDB errors
        if (error.name === 'MongooseError' || error.name === 'MongoError') {
            return NextResponse.json({ 
                success: false, 
                message: 'Database connection error. Please try again.' 
            }, { status: 503 });
        }

        // Handle authentication errors
        if (error.message.includes('unauthorized') || error.message.includes('auth')) {
            return NextResponse.json({ 
                success: false, 
                message: 'Authentication failed' 
            }, { status: 401 });
        }

        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error. Please try again later.' 
        }, { status: 500 });
    }
}