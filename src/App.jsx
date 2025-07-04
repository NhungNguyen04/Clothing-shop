import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import TryOn from './pages/TryOn';
import CheckOut from './pages/CheckOut';
import DirectCheckOut from './pages/DirectCheckOut';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import AuthError from './pages/AuthError';
import Dashboard from './pages/Admin/Dashboard';
import ProductList from './pages/Admin/Products';
import CategoryPage from './pages/Admin/Category';
import SellerList from './pages/Admin/components/SellerList';
import OrderList from './pages/Admin/OrderList';
import Invoice from './pages/Admin/Invoice';
import Transactions from './pages/Admin/Transactions';
import { useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
import TrackOrder from './pages/TrackOrder';
import OrderSuccess from './pages/OrderSuccess';
import SellerProfile from './pages/Admin/SellerProfile';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import AccountPage from './pages/Admin/Accounts';
import Reviews from './pages/Admin/Reviews';
import AdminSettings from './pages/Admin/Settings';
import SellerDashboard from './pages/Seller/SellerDashboard';
import SellerSettings from './pages/Seller/Settings';
import SellerChats from './pages/Seller/SellerChats';
import SellerChat from './pages/Seller/SellerChat';
import GeminiChatbot from './components/GeminiChatbot';
import SellerPage from './pages/SellerPage';
import SellerRegister from './pages/SellerRegister';
import Chat from './pages/Chat';
import Chats from './pages/Chats';
import Notification from './pages/Notification';
import SellerOwnProfile from './pages/Seller/SellerProfile';
import AdminProfile from './pages/Admin/AdminProfile';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSellerRoute = location.pathname.startsWith('/seller');
  const { user, isAdmin, isSeller } = useAuth()

  console.log("User state in App.jsx:", user);

  return (
    <div className={isAdminRoute || isSellerRoute ? '' : 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'}>
      <ToastContainer />
      {(!isAdminRoute && !isSellerRoute) && <Navbar />}
      {(!isAdminRoute && !isSellerRoute) && <SearchBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/collection" element={<Collection />} />        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/check-out/:cartId" element={<CheckOut />} />
        <Route path="/direct-checkout/:productId" element={<DirectCheckOut />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<TrackOrder />} />
        <Route path="/try-on/:productId" element={<TryOn />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/auth-error" element={<AuthError />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/seller/:id" element={<SellerPage />} />        
        <Route path="/seller-register" element={<SellerRegister/>} />        
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/notification" element={ <Notification/>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/admin/category" element={isAdmin ? <CategoryPage /> : <Navigate to="/" />} />
        <Route path="/admin/seller-list" element={isAdmin ? <SellerList /> : <Navigate to="/" />} />
        <Route path="/admin/seller-profile/:id" element={isAdmin ? <SellerProfile/> : <Navigate to="/" />} />
        <Route path="/admin/invoice" element={isAdmin ? <Invoice /> : <Navigate to="/" />} />
        <Route path="/admin/transactions" element={isAdmin ? <Transactions /> : <Navigate to="/" />} />
        <Route path="/admin/seller-accounts" element={isAdmin ? <AccountPage type="seller" /> : <Navigate to="/" />} />
        <Route path="/admin/customer-accounts" element={isAdmin ? <AccountPage type="customer" /> : <Navigate to="/" />} />
        <Route path="/admin/admin-accounts" element={isAdmin ? <AccountPage type="admin" /> : <Navigate to="/" />} />
        <Route path="/admin/reviews" element={isAdmin ? <Reviews /> : <Navigate to="/" />} />
        <Route path="/admin/settings" element={isAdmin ? <AdminSettings /> : <Navigate to="/" />} />
        <Route path="/admin/profile" element={isAdmin ? <AdminProfile /> : <Navigate to="/" />} />

        {/* Seller Routes */}
        <Route path="/seller/products" element={isSeller ? <ProductList /> : <Navigate to="/" />} />
        <Route path="/seller/orders" element={isSeller ? <OrderList /> : <Navigate to="/" />} />
        <Route path="/seller/reviews" element={isSeller ? <Reviews /> : <Navigate to="/" />} />
        <Route path="/seller/dashboard" element={isSeller ? <SellerDashboard /> : <Navigate to="/" />} />
        <Route path="/seller/settings" element={isSeller ? <SellerSettings /> : <Navigate to="/" />} />
        <Route path="/seller/chats" element={isSeller ? <SellerChats /> : <Navigate to="/" />} />
        <Route path="/seller/chat/:conversationId" element={isSeller ? <SellerChat /> : <Navigate to="/" />} />
        <Route path="/seller/profile" element={isSeller ? <SellerOwnProfile /> : <Navigate to="/" />} />

      </Routes>
      {(!isAdminRoute && !isSellerRoute) && <Footer />}
      {(!isAdminRoute && !isSellerRoute) && <GeminiChatbot />}
    </div>
  );
}

export default App;
