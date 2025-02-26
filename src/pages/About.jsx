import React from 'react'
import NewsLetterBox from '../components/NewsLetterBox'

function About() {
  return (
    <div>
      <div className="flex items-center justify-center">
        <h2 className="text-lg pb-2 text-[#171717]"><span className="text-[#707070]">ABOUT</span> US</h2>
        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 items-center mb-12">
        <img
          src="https://s3-alpha-sig.figma.com/img/20d9/e4fe/75340ae380a1578ddc66bd6d23d2317f?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Ih2qjgLL7FRE0mn~XGdU-7fnNSBToTIbhGwb0z0NV6qNfDhwafkZhKcA9XM1Em2f33obseHuaPwp21WYWsH6stWmqEUqHYCfHjeJ5oFVO~P2-KWUwKCJXfp9gidsqGEn5pcEPRaWWMEIGOXP1siaOycEBlFuuwNxeFOGgFr0JT0BphbGWgre0jubzcA5-3Fe4AhWtoMn~LYEmUmf~zjmGzIupgZqCiStI~M0Zzndm5LZKogpaJ25lmrR5Hz82s1M2C-WLY9d8TtcSqHxjIloCmfYdDe7YqGgzsgqkWAqdHCFyEr5ewomRNZ5CEpARx-aFPBK8klUVv21RNvgllaHbw__"
          alt="About Us"
          className="w-[500px] h-[500px] rounded-lg"
        />
        <div>
          <p className="text-[#6D6D6D] text-[14px] mb-4">
            Forever was born out of a passion for innovation and a desire to revolutionize
            the way people shop online. Our journey began with a simple idea: to provide
            a platform where customers can easily discover, explore, and purchase a wide
            range of products from the comfort of their homes.
          </p>
          <p className="text-[#6D6D6D] text-[14px] mb-4">
            Since our inception, we've worked tirelessly to curate a diverse selection of
            high-quality products that cater to every taste and preference. From fashion
            and beauty to electronics and home essentials, we offer an extensive collection
            sourced from trusted brands and suppliers.
          </p>
          <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
          <p className="text-[#6D6D6D] text-[14px]">
            Our mission at Forever is to empower customers with choice, convenience, and
            confidence. We're dedicated to providing a seamless shopping experience that
            exceeds expectations, from browsing and ordering to delivery and beyond.
          </p>
        </div>
      </div>
      <div>
        <div className="flex items-center">
          <h2 className="text-lg pb-2 text-[#171717]"><span className="text-[#707070]">WHY</span> CHOOSE US</h2>
          <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-2">QUALITY ASSURANCE</h4>
            <p className="text-gray-600">
              We meticulously select and vet each product to ensure it meets our stringent quality standards.
            </p>
          </div>
          <div className="border p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-2">CONVENIENCE</h4>
            <p className="text-gray-600">
              With our user-friendly interface and hassle-free ordering process, shopping has never been easier.
            </p>
          </div>
          <div className="border p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-2">EXCEPTIONAL CUSTOMER SERVICE</h4>
            <p className="text-gray-600">
              Our team of dedicated professionals is here to assist you every step of the way, ensuring your satisfaction is our top priority.
            </p>
          </div>
        </div>
      </div>
      <div className='mt-12'>
        <NewsLetterBox/>
      </div>
    </div>
  )
}

export default About
