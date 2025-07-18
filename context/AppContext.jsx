'use client';
import { productsDummyData, userDummyData } from '@/assets/assets';
import { useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY;
    const router = useRouter();

    const { user } = useUser();
    const { getToken } = useAuth();

    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [cartItems, setCartItems] = useState({});

    const fetchProductData = async () => {
        try {
            const { data } = await axios.get('/api/product/list');

            if (data.success) {
                setProducts(data.products);
            } else {
                toast.error(data.message);
                console.error('Error fetching products:', data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.error('Error fetching products:', error);
        }
    };

    const fetchUserData = async () => {
        try {
            if (user.publicMetadata.role == 'seller') {
                setIsSeller(true);
            }

            const token = await getToken();

            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                setUserData(data.user);
                setCartItems(data.user.cartItems);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error(error.message);
        }
    };

    const addToCart = async (itemId) => {
        const product = products.find(p => p._id === itemId);
        
        if (!product) {
            toast.error('Product not found');
            return;
        }

        if (!product.stock || product.stock <= 0) {
            toast.error('Product is out of stock');
            return;
        }

        const MAX_CART_ITEMS = 10;
        let cartData = structuredClone(cartItems);
        const currentQuantity = cartData[itemId] || 0;

        if (currentQuantity >= product.stock) {
            toast.error(`Only ${product.stock} items available in stock`);
            return;
        }

        if (currentQuantity >= MAX_CART_ITEMS) {
            toast.error(`You can only add up to ${MAX_CART_ITEMS} of this item.`);
            return;
        }

        if (cartData[itemId]) {
            cartData[itemId] += 1;
            toast.success(`Item added to cart (${cartData[itemId]})`);
        } else {
            cartData[itemId] = 1;
            toast.success('Item added to cart');
        }

        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken();
                await axios.post('/api/cart/update', { cartData }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error updating cart:', error.message);
                toast.error('Failed to update cart. Please try again.');
            }
        }
    };

    const updateCartQuantity = async (itemId, quantity) => {
        const product = products.find(p => p._id === itemId);
        let cartData = structuredClone(cartItems);

        if (quantity < 0) {
            delete cartData[itemId];
            toast.success('Item removed from cart');
        } else if (quantity === 0) {
            delete cartData[itemId];
            toast.success('Item removed from cart');
        } else {
            if (product && quantity > product.stock) {
                toast.error(`Only ${product.stock} items available in stock`);
                return;
            }
            cartData[itemId] = quantity;
        }

        setCartItems(cartData);

        if (user) {
            try {
                const token = await getToken();
                await axios.post('/api/cart/update', { cartData }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error updating cart:', error.message);
                toast.error('Failed to update cart. Please try again.');
            }
        }
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                const price = itemInfo.offerPrice || itemInfo.price;
                totalAmount += price * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    };

    useEffect(() => {
        fetchProductData();
    }, []);

    
    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};