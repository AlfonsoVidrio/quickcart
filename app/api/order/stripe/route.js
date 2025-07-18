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
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'You must be logged in to place an order' 
            }, { status: 401 });
        }

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
        let amount = 0;

        // Validate stock and prepare product data
        for (const item of items) {
            // Validate quantity is a positive integer
            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                return NextResponse.json({ 
                    success: false, 
                    message: `Invalid quantity for product ${item.product}. Quantity must be a positive whole number.` 
                }, { status: 400 });
            }

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
            productData.push({
                name: product.name,
                price: product.offerPrice || product.price,
                quantity: item.quantity,
            });
            amount += (product.offerPrice || product.price) * item.quantity;
        }

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