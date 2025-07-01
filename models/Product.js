import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    userId: {type: String, required: true, ref:'user'},
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, default: null, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: { type: Array, required: true },
    date: { type: Number, required: true }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;