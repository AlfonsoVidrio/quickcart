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
                message: 'You must be logged in to access user data' 
            }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(userId);

        if ( !user ) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}