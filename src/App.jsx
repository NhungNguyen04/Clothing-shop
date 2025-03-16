import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import TryOn from './pages/TryOn'
import CheckOut from './pages/CheckOut'
import ContactUs from './pages/ContactUs'
import Register from './pages/Register'
import AuthSuccess from './pages/AuthSuccess'
import AuthError from './pages/AuthError'
import Dashboard from './pages/Admin/Dashboard'
import { useLocation } from 'react-router-dom'
import ProductList from './pages/Admin/Products'
import CategoryPage from './pages/Admin/Category'
import SellerCard from './pages/Admin/Sellers'
import SellerList from './pages/Admin/components/SellerList'
import OrderList from './pages/Admin/OrderList'
import Invoice from './pages/Admin/Invoice'
import Transactions from './pages/Admin/Transactions'
import AccountPage from './pages/Admin/Accounts'
import ReviewsPage from './pages/Admin/Reviews'

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={isAdminRoute ? '' : 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'}>
      <ToastContainer />
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <SearchBar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/check-out" element={<CheckOut />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/try-on/:productId" element={<TryOn />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/auth-error" element={<AuthError />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/category" element={<CategoryPage />} />
          <Route path="/admin/seller-list" element={<SellerList/>} />
          <Route path="/admin/seller-card" element={<SellerCard />} />
          <Route path="/admin/order-list" element={<OrderList />} />
          <Route path="/admin/invoice" element={<Invoice />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/seller-accounts" element={<AccountPage type="seller" />} />
          <Route path="/admin/customer-accounts" element={<AccountPage type="customer" />} />
          <Route path="/admin/admin-accounts" element={<AccountPage type="admin" />} />
          <Route path="/admin/reviews" element={<ReviewsPage/>} />
        </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App