import connectDB from '@/config/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const body = await request.text();

        const sig = request.headers.get('stripe-signature');

        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        const handlePaymentIntent = async (paymentIntentId, isPaid) => {
            try {
                const sessions = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntentId
                });

                if (!sessions.data || sessions.data.length === 0) {
                    console.error('No session found for payment intent:', paymentIntentId);
                    return;
                }

                const session = sessions.data[0];
                if (!session.metadata || !session.metadata.orderId || !session.metadata.userId) {
                    console.error('Missing metadata in session:', session.id);
                    return;
                }

                const { orderId, userId } = session.metadata;

                await connectDB();

                if (isPaid) {
                    const order = await Order.findById(orderId);
                    if (order) {
                        // Update stock for each product in the order
                        for (const item of order.items) {
                            await Product.findByIdAndUpdate(
                                item.product, 
                                { $inc: { stock: -item.quantity } }
                            );
                        }
                    }
                    await Order.findByIdAndUpdate(orderId, { isPaid: true });
                    await User.findByIdAndUpdate(userId, { cartItems: {} });
                    console.log(`Order ${orderId} marked as paid and stock updated`);
                } else {
                    await Order.findByIdAndDelete(orderId);
                    console.log(`Order ${orderId} deleted due to failed payment`);
                }
            } catch (error) {
                console.error('Error handling payment intent:', error);
            }
        };

        switch (event.type) {
            case 'payment_intent.succeeded':{
                await  handlePaymentIntent(event.data.object.id, true);
                break;
            }
            case 'payment_intent.canceled':{
                await handlePaymentIntent(event.data.object.id, false);
                break;
            }
            default:
                console.warn(`Unhandled event type ${event.type}`);
                break;
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export const config = {
    api: { bodyParser: false }
};