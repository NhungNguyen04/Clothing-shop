import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
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
import ContactUs from './pages/ContactUs';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import AuthError from './pages/AuthError';
import Dashboard from './pages/Admin/Dashboard';
import ProductList from './pages/Admin/Products';
import CategoryPage from './pages/Admin/Category';
import SellerCard from './pages/Admin/Sellers';
import SellerList from './pages/Admin/components/SellerList';
import OrderList from './pages/Admin/OrderList';
import Invoice from './pages/Admin/Invoice';
import Transactions from './pages/Admin/Transactions';
import AccountPage from './pages/Admin/Accounts';
import Reviews from './pages/Admin/Reviews';
import useAuth from './hooks/useAuth';
import Seller from './pages/Seller/Seller';
import SellerProfile from './pages/Admin/SellerProfile';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSellerRoute = location.pathname.startsWith('/seller');
  const user = useAuth()

  return (
    <div className={isAdminRoute || isSellerRoute ? '' : 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'}>
      <ToastContainer />
      {(!isAdminRoute && !isSellerRoute) && <Navbar />}
      {(!isAdminRoute && !isSellerRoute) && <SearchBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/check-out" element={<CheckOut />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/try-on/:productId" element={<TryOn />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/auth-error" element={<AuthError />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/category" element={<CategoryPage />} />
        <Route path="/admin/seller-list" element={<SellerList />} />
        <Route path="/admin/seller-card" element={<SellerCard />} />
        <Route path="/admin/seller-profile/:id" element={<SellerProfile/>} />
        <Route path="/admin/invoice" element={<Invoice />} />
        <Route path="/admin/transactions" element={<Transactions />} />
        <Route path="/admin/seller-accounts" element={<AccountPage type="seller" />} />
        <Route path="/admin/customer-accounts" element={<AccountPage type="customer" />} />
        <Route path="/admin/admin-accounts" element={<AccountPage type="admin" />} />
        <Route path="/admin/reviews" element={<Reviews />} />


        <Route path="/seller" element={<Seller />} />
        <Route path="/seller/products" element={<ProductList />} />
        <Route path="/seller/orders" element={<OrderList />} />
      </Routes>
      {(!isAdminRoute && !isSellerRoute) && <Footer />}
    </div>
  );
}

export default App;
