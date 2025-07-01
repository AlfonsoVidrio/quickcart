import connectDB from '@/config/db';
import Order from '@/models/Order';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { address, items } = await request.json();
        const origin = request.headers.get('origin');

        if (!address) {
            return NextResponse.json({ success: false, message: 'Address is required' }, { status: 400 });
        }

        console.log('items', items);
        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'No items in cart' }, { status: 400 });
        }



        await connectDB();

        let productData = [];

        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return await acc + product.offerPrice * item.quantity;
        }, 0);

        // Calculate total with tax (tax will be added as separate line item in Stripe)
        const totalWithTax = amount + Math.floor(amount * 0.036);

        const order = await Order.create({
            userId,
            address,
            items,
            amount: totalWithTax,
            date: Date.now(),
            paymentType: 'Stripe'
        });

        // create line items for Stripe
        const line_items = productData.map(item => {
            return {
                price_data: {
                    currency: 'mxn',
                    product_data: {
                        name: item.name
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity
            };
        });

        const taxAmount = Math.floor(amount * 0.036);
        line_items.push({
            price_data: {
                currency: 'mxn',
                product_data: {
                    name: 'Tax (3.6%)'
                },
                unit_amount: taxAmount * 100,
            },
            quantity: 1
        });

        // create session with Stripe
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode:'payment',
            success_url: `${origin}/order-placed`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId:order._id.toString(),
                userId
            }
        });

        const url = session.url;

        return NextResponse.json({ success: true, url }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}