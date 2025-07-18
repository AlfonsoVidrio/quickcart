import connectDB from '@/config/db';
import Address from '@/models/Address';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET( request ) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'You must be logged in to access addresses' 
            }, { status: 401 });
        }

        await connectDB();

        const addresses = await Address.find({userId});
        return NextResponse.json({ success: true, addresses}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to retrieve addresses', error: error.message }, { status: 500 });
    }
}