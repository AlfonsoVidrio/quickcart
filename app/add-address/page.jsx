'use client';
import { assets } from '@/assets/assets';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const AddAddress = () => {

    const { getToken, router } = useAppContext();
    
    const [address, setAddress] = useState({
        fullName: '',
        phoneNumber: '',
        postalCode: '',
        neighborhood: '',
        city: '',
        state: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/user/add-address', { address }, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                toast.success(data.message);
                setAddress({
                    fullName: '',
                    phoneNumber: '',
                    postalCode: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                });
                router.push('/cart');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error adding address:', error);
            
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else if (error.response && error.response.status === 401) {
                toast.error('You must be logged in to add an address');
            } else {
                toast.error('Failed to add address. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
                <form onSubmit={onSubmitHandler} className="w-full">
                    <p className="text-2xl md:text-3xl text-gray-500">
                        Add Shipping <span className="font-semibold text-orange-600">Address</span>
                    </p>
                    <div className="space-y-3 max-w-sm mt-10">
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Full name"
                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                            value={address.fullName}
                            required
                        />
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="tel"
                            pattern="[0-9+\-\s\(\)]+"
                            title="Phone number should contain only digits, spaces, and special characters like +, -, ( )"
                            placeholder="Phone number"
                            onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                            value={address.phoneNumber}
                            required
                        />
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Postal code"
                            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                            value={address.postalCode}
                            required
                        />
                        <textarea
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
                            rows={4}
                            placeholder="Address (Neighborhood and Street)"
                            onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                            value={address.neighborhood}
                            required
                        ></textarea>
                        <div className="flex space-x-3">
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="City/District/Town"
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                value={address.city}
                                required
                            />
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="State"
                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                value={address.state}
                                required
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`max-w-sm w-full mt-6 py-3 uppercase text-white font-medium ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                    >
                        {isLoading ? 'SAVING...' : 'Save address'}
                    </button>
                </form>
                <Image
                    className="md:mr-16 mt-16 md:mt-0"
                    src={assets.my_location_image}
                    alt="my_location_image"
                />
            </div>
            <Footer />
        </>
    );
};

export default AddAddress;