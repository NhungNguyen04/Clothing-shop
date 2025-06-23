import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { FaComment, FaShoppingCart, FaUser, FaHeart } from 'react-icons/fa';

const Profile = () => {
    const user = useAuth()
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [retypeNewPassword, setRetypeNewPassword] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (password) formData.append('password', password);
        if (image) formData.append('image', image);

        try {
            const response = await axiosInstance.put(`/users/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== retypeNewPassword) {
            setMessage('New passwords do not match.');
            return;
        }
        // Add logic to change password here
        // Example: await axiosInstance.post(`/users/${user.id}/change-password`, { oldPassword, newPassword });
        setModalOpen(false);
        setMessage('Password changed successfully!');
    };

    return (
        <div className="p-6 w-3/4 mx-auto min-h-screen">
            {message && <p className="text-red-500">{message}</p>}
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link to="/chats" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaComment className="text-2xl text-pink-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">My Chats</h3>
                      <p className="text-sm text-gray-600">View conversations</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/orders" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaShoppingCart className="text-2xl text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">My Orders</h3>
                      <p className="text-sm text-gray-600">Track orders</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/collection" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaHeart className="text-2xl text-red-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Shop</h3>
                      <p className="text-sm text-gray-600">Browse products</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/cart" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaUser className="text-2xl text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Cart</h3>
                      <p className="text-sm text-gray-600">View cart</p>
                    </div>
                  </div>
                </Link>
              </div>

            <div className="flex justify-center mb-4">
                <label className="cursor-pointer">
                    <img 
                        src={user?.image || 'default-avatar.png'} 
                        alt="Profile Avatar" 
                        className="w-24 h-24 rounded-full bg-white border-2 border-gray-300" 
                    />
                    <input 
                        type="file" 
                        onChange={handleImageChange} 
                        className="hidden" 
                    />
                </label>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border px-4 py-2 w-full rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border px-4 py-2 w-full rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border px-4 py-2 w-full rounded-md"
                    />
                </div>
                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className={`bg-pink-600 text-white px-4 py-2 rounded-md ${loading ? 'opacity-50' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md ml-4"
                    >
                        Change Password
                    </button>
                </div>
            </form>

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-4">
                                <label className="block mb-2">Old Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="border px-4 py-2 w-full rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="border px-4 py-2 w-full rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Retype New Password</label>
                                <input
                                    type="password"
                                    value={retypeNewPassword}
                                    onChange={(e) => setRetypeNewPassword(e.target.value)}
                                    className="border px-4 py-2 w-full rounded-md"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-pink-600 text-white px-4 py-2 rounded-md"
                            >
                                Change Password
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="bg-gray-400 text-white px-4 py-2 rounded-md ml-2"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
