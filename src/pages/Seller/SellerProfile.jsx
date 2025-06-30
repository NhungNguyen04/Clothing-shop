import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Eye, EyeOff, CheckCircle, AlertCircle, X, MapPin, Plus, Edit, Trash2, Phone, Store, LogOut, Home, Building } from 'lucide-react';
import { useAuthStore } from '../../store/AuthStore';
import { updateSeller, getSellerByUserId, getSellerById } from '../../services/seller';
import Spinner from '../../components/Spinner';
import DeliveryInformation from '../../components/DeliInformation';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../Admin/components/AdminLayout';
import { set } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const SellerOwnProfile = () => {
    const { user: authUser, seller: authSeller, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    
    const [seller, setSeller] = useState(null);
    const [managerName, setManagerName] = useState('');
    const [email, setEmail] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [modalOpen, setModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [retypeNewPassword, setRetypeNewPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [activeTab, setActiveTab] = useState('profile');
    const {logout} = useAuth();
    
    // Address management states
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [addressForm, setAddressForm] = useState({
        phoneNumber: '',
        address: '',
        street: '',
        ward: '',
        district: '',
        province: '',
        postalCode: ''
    });
    const [addressLoading, setAddressLoading] = useState(false);

    useEffect(() => {
        const fetchSellerData = async () => {
            if (!authUser?.id) {
                setLoading(false);
                return;
            }

            if (authSeller) {
                setSeller(authSeller);
                setManagerName(authSeller.managerName || '');
                setEmail(authSeller.email || '');
                setImagePreview(authSeller.image || null);
                
                // Set address data if available
                if (authSeller.address) {
                    setAddressForm({
                        phoneNumber: authSeller.address.phoneNumber || '',
                        address: authSeller.address.address || '',
                        street: authSeller.address.street || '',
                        ward: authSeller.address.ward || '',
                        district: authSeller.address.district || '',
                        province: authSeller.address.province || '',
                        postalCode: authSeller.address.postalCode || ''
                    });
                }
                setLoading(false);
                return;
            }

            // Only fetch if no authSeller exists
            try {
                setLoading(true);
                const response = await getSellerByUserId(authUser.id);
                if (response.success && response.data?.seller) {
                    const sellerData = response.data.seller;
                    setSeller(sellerData);
                    setManagerName(sellerData.managerName || '');
                    setEmail(sellerData.email || '');
                    setImagePreview(sellerData.image || null);
                    
                    // Set address data if available
                    if (sellerData.address) {
                        setAddressForm({
                            phoneNumber: sellerData.address.phoneNumber || '',
                            address: sellerData.address.address || '',
                            street: sellerData.address.street || '',
                            ward: sellerData.address.ward || '',
                            district: sellerData.address.district || '',
                            province: sellerData.address.province || '',
                            postalCode: sellerData.address.postalCode || ''
                        });
                    }
                } else {
                    setMessage('No seller profile found.');
                    setMessageType('error');
                }
            } catch (error) {
                setMessage('Failed to load seller profile.');
                setMessageType('error');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSellerData();
    }, [authUser?.id, authSeller?.id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setMessage('Image size should be less than 5MB');
                setMessageType('error');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const handleNewPasswordChange = (e) => {
        const pwd = e.target.value;
        setNewPassword(pwd);
        setPasswordStrength(calculatePasswordStrength(pwd));
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'Very Weak';
            case 2: return 'Weak';
            case 3: return 'Fair';
            case 4: return 'Good';
            case 5: return 'Strong';
            default: return '';
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-pink-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-300';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        let imageUrl = imagePreview; // Default to existing image

        // Upload new image if selected
        if (image) {
            try {
                const formData = new FormData();
                formData.append('file', image);
                const uploadRes = await axiosInstance.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                imageUrl = uploadRes.data.data;
            } catch (error) {
                setMessage('Upload image failed!');
                setMessageType('error');
                setLoading(false);
                return;
            }
        }

        // Prepare seller update payload
        const payload = {
            managerName: managerName || '',
            email: email || '',
            image: imageUrl || '',
        };

        try {
            const response = await updateSeller(seller.id, payload);
            if (response.success) {
                setMessage('Profile updated successfully!');
                setMessageType('success');
                setSeller(response.data.updatedSeller || response.data.seller);
                setImagePreview(response.data.updatedSeller?.image || response.data.seller?.image || imageUrl);
            } else {
                setMessage('Failed to update profile.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating profile. Please try again.');
            setMessageType('error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== retypeNewPassword) {
            setMessage('New passwords do not match.');
            setMessageType('error');
            return;
        }
        
        if (passwordStrength < 3) {
            setMessage('Password is too weak. Please choose a stronger password.');
            setMessageType('error');
            return;
        }

        try {
            // Use the user API for password change, not seller API
            const response = await axiosInstance.patch(`/users/${authUser.id}`, {
                password: newPassword,
                oldPassword: oldPassword
            });
            
            if (response.data.success) {
                setModalOpen(false);
                setOldPassword('');
                setNewPassword('');
                setRetypeNewPassword('');
                setMessage('Password changed successfully!');
                setMessageType('success');
            } else {
                setMessage('Failed to change password. Please check your old password.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error changing password. Please check your old password.');
            setMessageType('error');
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setRetypeNewPassword('');
        setMessage('');
    };

    // Address management functions
    const openAddressModal = () => {
        if (seller?.address) {
            setAddressForm({
                phoneNumber: seller.address.phoneNumber || '',
                address: seller.address.address || '',
                street: seller.address.street || '',
                ward: seller.address.ward || '',
                district: seller.address.district || '',
                province: seller.address.province || '',
                postalCode: seller.address.postalCode || ''
            });
        }
        setAddressModalOpen(true);
    };

    const closeAddressModal = () => {
        setAddressModalOpen(false);
        setMessage('');
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setAddressLoading(true);
        setMessage('');

        try {
            const response = await updateSeller(seller.id, {
                addressInfo: addressForm
            });
            
            if (response.success) {
                setMessage('Address updated successfully!');
                setMessageType('success');
                setSeller(response.data.updatedSeller || response.data.seller);
                closeAddressModal();
            } else {
                setMessage('Failed to update address.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating address. Please try again.');
            setMessageType('error');
        } finally {
            setAddressLoading(false);
        }
    };

    // Handlers for DeliveryInformation component
    const handleDeliveryChange = (field, value) => {
        setAddressForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLocationChange = (location) => {
        setAddressForm(prev => ({
            ...prev,
            ward: location.ward,
            district: location.district,
            province: location.province
        }));
    };

    const handleLogout = () => {
        
        logout();
        navigate('/login');
    };

    const handleSwitchToCustomer = () => {
        navigate('/');
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    console.log('Seller Profile Rendered', seller);
    return (
        <>
        <AdminLayout>
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header with Action Buttons */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Profile</h1>
                        <p className="text-gray-600">Manage your seller account information</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSwitchToCustomer}
                            className="bg-pink-500 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Customer Section
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        messageType === 'success' 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {messageType === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span>{message}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-12 text-white relative">
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <Store className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                    <input 
                                        type="file" 
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden" 
                                    />
                                </label>
                            </div>
                            <h2 className="text-2xl font-bold mt-4">{managerName || 'Manager Name'}</h2>
                            <p className="text-green-100 mt-1">{email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    seller?.status === 'APPROVED' ? 'bg-green-500 text-white' :
                                    seller?.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                                    'bg-red-500 text-white'
                                }`}>
                                    {seller?.status || 'Unknown'}
                                </span>
                            </div>
                            <p className="text-green-100 text-sm mt-2">
                                Seller since {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : ''}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex px-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'profile'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Seller Information
                            </button>
                            <button
                                onClick={() => setActiveTab('address')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'address'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Business Address
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'security'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Security
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Manager Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Manager Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={managerName}
                                            onChange={(e) => setManagerName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="Enter manager name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Status Display */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Status
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                            seller?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            seller?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {seller?.status || 'Unknown'}
                                        </span>
                                        {seller?.status === 'PENDING' && (
                                            <span className="text-sm text-gray-600">Your account is under review</span>
                                        )}
                                        {seller?.status === 'APPROVED' && (
                                            <span className="text-sm text-gray-600">Your account is active</span>
                                        )}
                                        {seller?.status === 'REJECTED' && (
                                            <span className="text-sm text-gray-600">Please contact support</span>
                                        )}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Business Address</h3>
                                        <p className="text-gray-600">Manage your business address information</p>
                                    </div>
                                    <button
                                        onClick={openAddressModal}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Update Address
                                    </button>
                                </div>

                                {/* Address Display */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    {seller?.address ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-5 h-5 text-green-600" />
                                                <span className="font-medium text-gray-900">
                                                    {[seller.address.address, seller.address.street].filter(Boolean).join(', ')}
                                                </span>
                                            </div>
                                            {seller.address.phoneNumber && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{seller.address.phoneNumber}</span>
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-500">
                                                {[seller.address.ward, seller.address.district, seller.address.province]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </div>
                                            {seller.address.postalCode && (
                                                <div className="text-sm text-gray-500">
                                                    Postal Code: {seller.address.postalCode}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">No address set</h4>
                                            <p className="text-gray-600 mb-4">Add your business address</p>
                                            <button
                                                onClick={openAddressModal}
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Add Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Password</h3>
                                    <p className="text-gray-600 mb-4">
                                        Keep your account secure by using a strong password and changing it regularly.
                                    </p>
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Change Password
                                    </button>
                                </div>
                                
                                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Account Security Tips</h3>
                                    <ul className="text-yellow-700 space-y-1 text-sm">
                                        <li>• Use a unique password for this account</li>
                                        <li>• Include uppercase, lowercase, numbers, and symbols</li>
                                        <li>• Make your password at least 8 characters long</li>
                                        <li>• Don't share your password with others</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={handleNewPasswordChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={showRetypePassword ? "text" : "password"}
                                        value={retypeNewPassword}
                                        onChange={(e) => setRetypeNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRetypePassword(!showRetypePassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showRetypePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {retypeNewPassword && newPassword !== retypeNewPassword && (
                                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Address Management Modal */}
            {addressModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Update Business Address
                            </h2>
                            <button
                                onClick={closeAddressModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* Use DeliveryInformation Component */}
                            <DeliveryInformation
                                deliveryInfo={addressForm}
                                onDeliveryChange={handleDeliveryChange}
                                onLocationChange={handleLocationChange}
                            />

                            {/* Modal Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeAddressModal}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddressSubmit}
                                    disabled={addressLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {addressLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Update Address'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </AdminLayout>
        </>
    );
};

export default SellerOwnProfile;
