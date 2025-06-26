import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicies from '../components/OurPolicies'
import NewsLetterBox from '../components/NewsLetterBox'

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user?.role === 'SELLER') {
      navigate('/seller/dashboard', { replace: true });
    }
  }, [navigate]);

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
