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

function App() {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar/>
      <SearchBar/>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/collection" element={<Collection/>}></Route>
          <Route path="/about" element={<About/>}></Route>
          <Route path="/contact" element={<ContactUs/>}></Route>
          <Route path="/product/:productId" element={<Product/>}></Route>
          <Route path="/cart" element={<Cart/>}></Route>
          <Route path="/check-out" element={<CheckOut/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
          <Route path="/place-order" element={<PlaceOrder/>}></Route>
          <Route path="/orders" element={<Orders/>}></Route>
          <Route path="/try-on/:productId" element={<TryOn/>}></Route>
        </Routes>
        <Footer />
    </div>
  )
}

export default App
