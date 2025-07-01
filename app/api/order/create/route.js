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

        // Validate stock and calculate amount
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return NextResponse.json({ success: false, message: `Product not found: ${item.product}` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}` 
                }, { status: 400 });
            }
            amount += product.offerPrice * item.quantity;
        }

        amount += Math.floor(amount * 0.036);

        // Update stock for each product
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product, 
                { $inc: { stock: -item.quantity } }
            );
        }

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