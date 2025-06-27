import { useState, useEffect, useRef } from 'react';
import useSeller from '../../hooks/useSeller';
import axiosInstance from '../../api/axiosInstance';
import AdminLayout from '../Admin/components/AdminLayout';
import Spinner from '../../components/Spinner';

export default function SellerEditProfile() {
  const { seller, loading } = useSeller();
  const [form, setForm] = useState({
    managerName: '',
    email: '',
    address: '',
    description: '',
    image: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    if (seller) {
      setForm({
        managerName: seller.managerName || '',
        email: seller.email || '',
        address: seller.address || '',
        description: seller.description || '',
        image: seller.image || '',
      });
      setImagePreview(seller.image || '');
    }
  }, [seller]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setForm((prev) => ({ ...prev, image: res.data.data }));
      } catch (err) {
        alert('Upload image failed!');
      }
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await axiosInstance.patch(`/sellers/${seller.id}`, form);
      setSuccess(true);
      // Update localStorage seller info
      const userData = localStorage.getItem('userData');
      if (userData) {
        const userObj = JSON.parse(userData);
        userObj.image = form.image;
        userObj.name = form.managerName;
        localStorage.setItem('userData', JSON.stringify(userObj));
      }
      window.location.reload();
    } catch (err) {
      alert('Update failed!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center"><Spinner /></div>;
  if (!seller) return <div className="p-6 text-center text-gray-500">No seller info found.</div>;

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Edit Seller Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <img
              src={imagePreview || form.image || '/default-avatar.png'}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border mb-2 cursor-pointer"
              onClick={handleImageClick}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Manager Name</label>
            <input type="text" name="managerName" value={form.managerName} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            {success && <span className="text-green-600">Saved!</span>}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 