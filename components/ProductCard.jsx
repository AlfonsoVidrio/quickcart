import React, { useState } from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {

    const { currency, router } = useAppContext();
    const [imageError, setImageError] = useState(false);

    const getImageSrc = () => {
        if (imageError || !product?.images?.[0]) {
            return assets.upload_area;
        }
        return product.images[0];
    };

    const isValidProduct = product?._id && (product?.offerPrice || product?.price) && product?.stock > 0;

    return (
        <div
            onClick={() => { 
                if (isValidProduct) {
                    router.push('/product/' + product._id); 
                    scrollTo(0, 0);
                }
            }}
            className={`flex flex-col items-start gap-0.5 max-w-[200px] w-full ${isValidProduct ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                <Image
                    src={getImageSrc()}
                    alt={product?.name || 'Product image'}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                    onError={() => setImageError(true)}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <Image
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product?.name || 'Product name not available'}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product?.description || 'No description available'}</p>
            <p className={`text-xs ${product?.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product?.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock'}
            </p>
            <div className="flex items-center gap-2">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                {(product?.offerPrice || product?.price) ? (
                    <p className="text-base font-medium">{currency}{product.offerPrice || product.price}</p>
                ) : (
                    <p className="text-base font-medium text-gray-400">Price not available</p>
                )}
                <button 
                    disabled={!isValidProduct}
                    className={`max-sm:hidden px-4 py-1.5 border border-gray-500/20 rounded-full text-xs transition ${
                        isValidProduct 
                            ? 'text-gray-500 hover:bg-slate-50 cursor-pointer' 
                            : 'text-gray-300 cursor-not-allowed bg-gray-50'
                    }`}
                >
                    {product?.stock > 0 ? (isValidProduct ? 'Buy now' : 'Unavailable') : 'Out of stock'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;