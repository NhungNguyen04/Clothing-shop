import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Eye, EyeOff, CheckCircle, AlertCircle, X, MapPin, Plus, Edit, Trash2, Phone } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import axiosInstance from '../api/axiosInstance';
import AddressService from '../services/address';
import DeliveryInformation from '../components/DeliInformation';
import { Navigate } from 'react-router-dom';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Address management states
    const [addresses, setAddresses] = useState([]);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
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
        const fetchUser = async () => {
            if (!authUser?.id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/users/${authUser.id}`);
                if (response.data.success) {
                    const userData = response.data.data;
                    setUser(userData);
                    setName(userData.name || '');
                    setEmail(userData.email || '');
                    setPhoneNumber(userData.phoneNumber || '');
                    setImagePreview(userData.image || null);
                }
            } catch (error) {
                setMessage('Failed to load user profile.');
                setMessageType('error');
            } finally {
                setLoading(false);
            }
        };
        
        const fetchAddresses = async () => {
            if (!authUser?.id) {
                setLoading(false);
                return;
            }
            try {
                const userAddresses = await AddressService.getUserAddresses(authUser.id);
                setAddresses(userAddresses);
            } catch (error) {
                console.error('Failed to load addresses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
        fetchAddresses();
    }, [authUser]);

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

        let imageUrl = imagePreview; // Mặc định là ảnh cũ (nếu có)

        // Nếu có file ảnh mới, upload trước
        if (image) {
            try {
        const formData = new FormData();
                formData.append('file', image);
                const uploadRes = await axiosInstance.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                imageUrl = uploadRes.data.data; // Đường dẫn ảnh trả về từ API
            } catch (error) {
                setMessage('Upload image failed!');
                setMessageType('error');
                setLoading(false);
                return;
            }
        }

        // Chuẩn bị payload JSON
        const payload = {
            name: name || '',
            email: email || '',
            phoneNumber: phoneNumber || '',
            image: imageUrl || '', // luôn gửi image (có thể là cũ hoặc mới)
        };
        if (password) payload.password = password;

        try {
            const response = await axiosInstance.patch(`/users/${user.id}`, payload);
            if (response.data.success) {
            setMessage('Profile updated successfully!');
            setMessageType('success');
                setUser(response.data.data);
                setImagePreview(response.data.data.image || authUser?.image || null);
                setPhoneNumber(response.data.data.phoneNumber || '');
                // Cập nhật localStorage và reload để sync avatar
                localStorage.setItem('user', JSON.stringify({
                  ...authUser,
                  ...response.data.data
                }));
                setTimeout(() => {
                  window.location.reload();
                }, 800);
            } else {
                setMessage('Failed to update profile.');
                setMessageType('error');
            }
            setPassword('');
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
            // Replace with your actual API call
            // await axiosInstance.post(`/users/${user.id}/change-password`, { oldPassword, newPassword });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setModalOpen(false);
            setOldPassword('');
            setNewPassword('');
            setRetypeNewPassword('');
            setMessage('Password changed successfully!');
            setMessageType('success');
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
    const resetAddressForm = () => {
        setAddressForm({
            phoneNumber: '',
            address: '',
            street: '',
            ward: '',
            district: '',
            province: '',
            postalCode: ''
        });
        setEditingAddress(null);
    };

    const openAddressModal = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setAddressForm({
                phoneNumber: address.phoneNumber || '',
                address: address.address || '',
                street: address.street || '',
                ward: address.ward || '',
                district: address.district || '',
                province: address.province || '',
                postalCode: address.postalCode || ''
            });
        } else {
            resetAddressForm();
        }
        setAddressModalOpen(true);
    };

    const closeAddressModal = () => {
        setAddressModalOpen(false);
        resetAddressForm();
        setMessage('');
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setAddressLoading(true);
        setMessage('');

        try {
            const addressData = {
                ...addressForm,
                userId: authUser.id
            };

            let result;
            if (editingAddress) {
                result = await AddressService.updateAddress(editingAddress.id, addressData);
                setAddresses(addresses.map(addr => 
                    addr.id === editingAddress.id ? result : addr
                ));
                setMessage('Address updated successfully!');
            } else {
                result = await AddressService.createAddress(addressData);
                setAddresses([...addresses, result]);
                setMessage('Address added successfully!');
            }
            
            setMessageType('success');
            closeAddressModal();
        } catch (error) {
            setMessage('Error saving address. Please try again.');
            setMessageType('error');
        } finally {
            setAddressLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            await AddressService.deleteAddress(addressId);
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            setMessage('Address deleted successfully!');
            setMessageType('success');
        } catch (error) {
            setMessage('Error deleting address. Please try again.');
            setMessageType('error');
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

    if (!loading && !authUser?.id) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
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
                    <div className="bg-gradient-to-r from-pink-600 to-indigo-600 px-8 py-12 text-white relative">
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : authUser?.image ? (
                                        <img 
                                            src={authUser.image} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-16 h-16 text-gray-400" />
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
                            <h2 className="text-2xl font-bold mt-4">{name || 'Your Name'}</h2>
                            <p className="text-pink-100 mt-1">{email}</p>
                            <p className="text-pink-100 text-sm mt-2">
                                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
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
                                        ? 'border-pink-500 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'addresses'
                                        ? 'border-pink-500 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Addresses
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'security'
                                        ? 'border-pink-500 text-pink-600'
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
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                            placeholder="Enter your full name"
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
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                {/* Header with Add Button */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">My Addresses</h3>
                                        <p className="text-gray-600">Manage your delivery addresses</p>
                                    </div>
                                    <button
                                        onClick={() => openAddressModal()}
                                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Address
                                    </button>
                                </div>

                                {/* Addresses List */}
                                <div className="space-y-4">
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h4>
                                            <p className="text-gray-600 mb-4">Add your first address to get started</p>
                                            <button
                                                onClick={() => openAddressModal()}
                                                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Add Address
                                            </button>
                                        </div>
                                    ) : (
                                        addresses.map((address) => (
                                            <div key={address.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <MapPin className="w-5 h-5 text-pink-600" />
                                                            <span className="font-medium text-gray-900">
                                                                {AddressService.formatAddressForDisplay(address)}
                                                            </span>
                                                        </div>
                                                        {address.phoneNumber && (
                                                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                                <Phone className="w-4 h-4" />
                                                                <span>{address.phoneNumber}</span>
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-gray-500">
                                                            {[address.street, address.ward, address.district, address.province]
                                                                .filter(Boolean)
                                                                .join(' • ')}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openAddressModal(address)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                            title="Edit address"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAddress(address.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete address"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
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
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition-colors"
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
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
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
                                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition-colors"
                                >
                                    {addressLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        editingAddress ? 'Update Address' : 'Save Address'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;