import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items:[{
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        quantity: { 
            type: Number, 
            required: true,
            min: 1,
            validate: {
                validator: function(value) {
                    return Number.isInteger(value);
                },
                message: 'Quantity must be a whole number'
            }
        }
    }],
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true},
    status: { type: String, required: true, default: 'Order Placed' },
    date: { type: Number, required: true, default: Date.now },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;