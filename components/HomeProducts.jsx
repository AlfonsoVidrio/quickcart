import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '@/context/AppContext';

const HomeProducts = () => {

  const { products, router } = useAppContext();
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center pt-14">
        <p className="text-2xl font-medium text-left w-full">Popular products</p>
        <p className="text-gray-500 mt-4">No products available at the moment.</p>
      </div>
    );
  }
  const MAX_PRODUCTS = 10;
  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
        {[...products].reverse().slice(0, MAX_PRODUCTS).map((product) =>
          <ProductCard key={product._id} product={product} />
        )}
      </div>
      <button onClick={() => { router.push('/all-products'); }} className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
