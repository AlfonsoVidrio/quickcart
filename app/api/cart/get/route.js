import connectDB from '@/config/db';
import User from '@/models/User';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'You must be logged in to access cart' 
            }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(userId);

        const { cartItems } = user;

        return NextResponse.json({ success: true, cartItems }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}