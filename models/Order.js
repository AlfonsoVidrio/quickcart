import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user'},
    Items:[{
        product: { type: String, required: true, ref: 'product' },
        quantity: { type: Number, required: true}
    }],
    amount: { type: Number, required: true },
    address: { type: String, ref: 'address', required: true},
    status: { type: String, required: true, default: 'Order Placed' },
    date: { type: Number, required: true, default: Date.now }
});

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;