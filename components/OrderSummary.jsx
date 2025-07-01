import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const OrderSummary = () => {

  const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems, setCartItems } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaceOrderClicked, setIsPlaceOrderClicked] = useState(false);

  const [userAddresses, setUserAddresses] = useState([]);

  const hasCartItems = getCartCount() > 0;

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-address', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch addresses');
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (isLoading) return;

    try {

      if (!selectedAddress || !selectedAddress._id) {
        toast.error('Please select a valid address');
        return;
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({ product: key, quantity: cartItems[key] }));
      cartItemsArray = cartItemsArray.filter(item => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      setIsLoading(true);

      const token = await getToken();
      const { data } = await axios.post('/api/order/create', {
        address: selectedAddress._id,
        items: cartItemsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        router.push('/order-placed');
      } else {
        toast.error(data.message);
        console.error('Error creating order:', data.message);
      }

    } catch (error) {
      toast.error('Failed to create order');
      console.error('Error creating order:', error);
    } finally {
      setIsLoading(false);
    }

  };

  const createOrderStripe = async () => {
    if (isLoading) return;

    try {

      if (!selectedAddress || !selectedAddress._id) {
        return toast.error('Please select a valid address');
      }

      // Prepare cart items for order creation
      let cartItemsArray = Object.keys(cartItems).map((key) => ({ product: key, quantity: cartItems[key] }));
      cartItemsArray = cartItemsArray.filter(item => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error('Your cart is empty');
      }

      setIsLoading(true);

      const token = await getToken();

      const { data } = await axios.post('/api/order/stripe', {
        address: selectedAddress._id,
        items: cartItemsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
        console.error('Error creating order:', data.message);
      }

    } catch (error) {
      toast.error('Failed to create order');
      console.error('Error creating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  if (!hasCartItems) {
    return (
      <div className="w-full md:w-96 bg-gray-500/5 p-5">
        <h2 className="text-xl md:text-2xl font-medium text-gray-700">
          Order Summary
        </h2>
        <hr className="border-gray-500/30 my-5" />
        <div className="text-center py-8">
          <p className="text-gray-500">Your cart is empty</p>
          <button 
            onClick={() => router.push('/all-products')}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.neighborhood}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : 'Select Address'}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? 'rotate-0' : '-rotate-90'}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.neighborhood}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push('/add-address')}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{currency}{getCartAmount()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (3.6%)</p>
            <p className="font-medium text-gray-800">{currency}{Math.floor(getCartAmount() * 0.036)}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{currency}{getCartAmount() + Math.floor(getCartAmount() * 0.036)}</p>
          </div>

        </div>
      </div>

      {
        !isPlaceOrderClicked ? (
          <button
            onClick={() => setIsPlaceOrderClicked(true)}
            className={'w-full py-2 mt-5 text-white font-medium bg-orange-600 hover:bg-orange-700'}
          >
            Place Order
          </button>) : (
          <div className="flex gap-2">
            <button
              onClick={createOrder}
              disabled={isLoading}
              className={`w-full py-2 mt-5 text-white font-medium ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {isLoading ? 'Processing...' : 'Cash On Delivery'}
            </button>
            <button
              onClick={createOrderStripe}
              disabled={isLoading}
              className={`w-full py-2 mt-5 flex justify-center items-center border border-indigo-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
            >
              <Image className="w-12" src={assets.stripe_logo} alt="Stripe" />
            </button>

          </div>
        )
      }
    </div>
  );
};

export default OrderSummary;