import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../store/AuthStore';
import { createSeller } from '../services/seller';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeliveryInformation from '../components/DeliInformation';

const SellerRegister = () => {
  const { user } = useAuth();
  const { seller, setSeller } = useAuthStore();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    managerName: '',
    email: '',
    isDefault: true
  });
  // Delivery information state (for address)
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    street: '',
    postalCode: '',
    address: '' // Full address constructed by DeliveryInformation component
  });
  
  // State to store location data from DeliveryInformation component
  const [locationData, setLocationData] = useState({
    ward: '',
    district: '',
    province: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    // If user is already an approved seller, redirect to seller dashboard
    if (seller && seller.status === 'APPROVED') {
      navigate('/seller');
    }
    
    // Prefill form data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        managerName: user.name || '',
        email: user.email || ''
      }));
      
      // Also set delivery info name and email
      setDeliveryInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      }));
    }
    
    // If seller exists, prefill address information
    if (seller && seller.address) {
      const { address } = seller;
      setDeliveryInfo(prev => ({
        ...prev,
        street: address.line1 || '',
        // Vietnamese locations will be handled by the DeliveryInformation component
      }));
    }
  }, [user, seller, navigate]);

  // Handle changes to form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle delivery information changes
  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User information not available');
      return;
    }
    
    // Validate required fields
    if (!formData.managerName || !formData.email || !deliveryInfo.address) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {      // Create address object according to the Address type in user.ts
      const addressInfo = {
        address: deliveryInfo.address, // Full address as a string
        phoneNumber: deliveryInfo.phoneNumber || '',
        postalCode: deliveryInfo.postalCode || '',
        street: deliveryInfo.street || '',
        ward: locationData.ward || '', // Using ward from locationData state
        district: locationData.district || '', // Using district from locationData state
        province: locationData.province || '', // Using province from locationData state
        isDefault: true
      };
      
      const sellerData = {
        userId: user.id,
        email: formData.email,
        managerName: formData.managerName,
        status: 'PENDING',
        addressInfo
      };
        console.log('Submitting seller data:', sellerData);      const response = await createSeller(sellerData);
      console.log('Seller API response:', response);
      
      // Check if the response contains a seller object directly
      if (response && response.seller) {
        toast.success('Seller application submitted successfully!');
        setSeller(response.seller);
      } else if (response && response.data && response.data.seller) {
        // Alternative structure with data property
        toast.success('Seller application submitted successfully!');
        setSeller(response.data.seller);
      } else {
        toast.error(response.message || 'Failed to submit seller application');
      }
    } catch (error) {
      console.error('Error creating seller:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsLoading(false);
    }
  };

  // Display different UI based on seller status
  const renderContent = () => {
    // If seller exists and has a status
    if (seller) {
      if (seller.status === 'PENDING') {
        return (
          <div className="bg-pink-50 p-8 rounded-lg shadow-lg max-w-2xl mx-auto my-10 text-center">
            <h2 className="text-2xl font-bold text-pink-700 mb-4">Application Under Review</h2>
            <p className="text-pink-700 mb-6">
              Your seller application is currently being reviewed. We'll notify you once there's an update.
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="h-3 w-3 bg-pink-600 rounded-full"></div>
                <div className="h-3 w-3 bg-pink-600 rounded-full"></div>
                <div className="h-3 w-3 bg-pink-600 rounded-full"></div>
              </div>
            </div>
          </div>
        )
      }
      
      if (seller.status === 'REJECTED') {
        return (
          <div className="bg-red-50 p-8 rounded-lg shadow-lg max-w-2xl mx-auto my-10">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Application Rejected</h2>
            <p className="text-red-700 mb-6">
              Your seller application was not approved. You can update your information and resubmit.
            </p>
            {renderSellerForm()}
          </div>
        );
      }
    }
    
    // Default: Show the registration form
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto my-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Become a Seller</h2>
        <p className="text-gray-600 mb-6">
          Fill out the form below to register as a seller on our platform.
        </p>
        {renderSellerForm()}
      </div>
    );
  };

  // Form UI
  const renderSellerForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manager Name */}
          <div>
            <label htmlFor="managerName" className="block text-sm font-medium text-gray-700">
              Manager Name
            </label>
            <input
              type="text"
              id="managerName"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Business Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Business Address in Vietnam</h3>
            {/* Delivery Information Component */}
          <DeliveryInformation
            deliveryInfo={deliveryInfo}
            onDeliveryChange={handleDeliveryChange}
            onLocationChange={(data) => setLocationData(data)}
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={isLoading || !deliveryInfo.address}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              isLoading || !deliveryInfo.address ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
            }`}
            title={!deliveryInfo.address ? "Please complete the address information" : ""}
          >
            {isLoading ? 'Submitting...' : seller?.status === 'REJECTED' ? 'Resubmit Application' : 'Submit Application'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {renderContent()}
    </div>
  );
};

export default SellerRegister;
