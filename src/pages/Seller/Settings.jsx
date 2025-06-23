import { useState, useEffect } from 'react';
import AdminLayout from "../Admin/components/AdminLayout";
import useAuth from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosInstance';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SellerSettings() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    managerName: '',
    email: '',
    phoneNumber: '',
    image: '',
    address: '',
    postalCode: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypeNewPassword, setRetypeNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/sellers/user/${authUser?.id}`);
        const s = res.data.seller;
        setSeller(s);
        setForm({
          managerName: s.managerName || '',
          email: s.user?.email || '',
          phoneNumber: s.address?.phoneNumber || '',
          image: s.user?.image || '',
          address: s.address?.address || '',
          postalCode: s.address?.postalCode || '',
          description: s.description || '',
        });
        setImagePreview(s.user?.image || '');
      } catch (e) {
        toast.error('Không thể tải thông tin seller!');
      } finally {
        setLoading(false);
      }
    };
    if (authUser?.id) fetchSeller();
  }, [authUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    let imageUrl = form.image;
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.data;
      } catch (err) {
        toast.error('Upload avatar thất bại!');
        setSaving(false);
        return;
      }
    }
    try {
      const payload = {
        managerName: form.managerName,
        image: imageUrl,
        addressInfo: {
          address: form.address,
          phoneNumber: form.phoneNumber,
          postalCode: form.postalCode,
        },
        description: form.description,
      };
      await axiosInstance.patch(`/sellers/${seller.id}`, payload);
      // Update localStorage user
      localStorage.setItem('user', JSON.stringify({ ...authUser, image: imageUrl, name: form.managerName }));
      toast.success('Cập nhật thành công!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error('Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== retypeNewPassword) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    }
    if (passwordStrength < 3) {
      toast.error('Mật khẩu quá yếu!');
      return;
    }
    try {
      // Giả lập API đổi mật khẩu
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword(''); setNewPassword(''); setRetypeNewPassword('');
    } catch {
      toast.error('Đổi mật khẩu thất bại!');
    }
  };

  const calcStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  useEffect(() => { setPasswordStrength(calcStrength(newPassword)); }, [newPassword]);

  if (loading) return <Spinner />;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
        <h1 className="text-2xl font-bold mb-6">Seller Settings</h1>
        <div className="flex border-b mb-6">
          <button className={`py-2 px-4 font-medium ${activeTab==='profile'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}`} onClick={()=>setActiveTab('profile')}>Tài khoản</button>
          <button className={`py-2 px-4 font-medium ${activeTab==='security'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}`} onClick={()=>setActiveTab('security')}>Bảo mật</button>
          <button className={`py-2 px-4 font-medium ${activeTab==='shop'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}`} onClick={()=>setActiveTab('shop')}>Cửa hàng</button>
        </div>
        {activeTab==='profile' && (
          <form className="space-y-6" onSubmit={handleProfileSave}>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img src={imagePreview || '/default-avatar.png'} alt="avatar" className="w-24 h-24 rounded-full object-cover border" />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  <span className="text-xs">Đổi</span>
                </label>
              </div>
              <div>
                <div className="mb-2"><b>Trạng thái:</b> <span className={seller.status==='APPROVED'?'text-green-600':seller.status==='PENDING'?'text-yellow-600':'text-red-600'}>{seller.status}</span></div>
                <div className="mb-2"><b>Email:</b> {form.email}</div>
                <div className="mb-2"><b>Số điện thoại:</b> {form.phoneNumber}</div>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Tên quản lý</label>
              <input type="text" className="w-full border rounded p-2" value={form.managerName} onChange={e=>setForm(f=>({...f, managerName:e.target.value}))} required />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded" disabled={saving}>{saving?'Đang lưu...':'Lưu thay đổi'}</button>
          </form>
        )}
        {activeTab==='security' && (
          <form className="space-y-6" onSubmit={handlePasswordChange}>
            <div>
              <label className="block mb-1 font-medium">Mật khẩu cũ</label>
              <input type="password" className="w-full border rounded p-2" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Mật khẩu mới</label>
              <input type="password" className="w-full border rounded p-2" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
              <div className="h-2 bg-gray-200 rounded mt-1">
                <div className={`h-2 rounded ${['bg-red-500','bg-orange-500','bg-yellow-500','bg-blue-500','bg-green-500'][passwordStrength-1]||'bg-gray-300'}`} style={{width:`${(passwordStrength/5)*100}%`}}></div>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Nhập lại mật khẩu mới</label>
              <input type="password" className="w-full border rounded p-2" value={retypeNewPassword} onChange={e=>setRetypeNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Đổi mật khẩu</button>
          </form>
        )}
        {activeTab==='shop' && (
          <form className="space-y-6" onSubmit={handleProfileSave}>
            <div>
              <label className="block mb-1 font-medium">Tên cửa hàng</label>
              <input type="text" className="w-full border rounded p-2" value={form.managerName} onChange={e=>setForm(f=>({...f, managerName:e.target.value}))} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Địa chỉ</label>
              <input type="text" className="w-full border rounded p-2" value={form.address} onChange={e=>setForm(f=>({...f, address:e.target.value}))} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Mã bưu chính</label>
              <input type="text" className="w-full border rounded p-2" value={form.postalCode} onChange={e=>setForm(f=>({...f, postalCode:e.target.value}))} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Mô tả cửa hàng</label>
              <textarea className="w-full border rounded p-2" value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded" disabled={saving}>{saving?'Đang lưu...':'Lưu thay đổi'}</button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
} 