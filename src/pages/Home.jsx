import { useEffect } from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicies from '../components/OurPolicies'
import NewsLetterBox from '../components/NewsLetterBox'
import { useProductStore } from '../store/ProductStore'

const Home = () => {
  const { fetchProducts, fetchRecentProducts } = useProductStore();

  useEffect(() => {
    // Fetch all products when the home page loads
    fetchProducts();
    // Fetch recent products for the latest collection section
    fetchRecentProducts();
  }, [fetchProducts, fetchRecentProducts]);

  return (
    <div>
      <Hero/>
      <LatestCollection/>
      <BestSeller />
      <OurPolicies />
      <NewsLetterBox />
    </div>
  )
}

export default Home
