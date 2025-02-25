const ContactUs = () => {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-center mb-4">
                <h2 className="text-lg pb-2 text-[#171717]"><span className="text-[#707070]">ABOUT</span> US</h2>
                <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 items-center mb-12">
                <img
                src="https://s3-alpha-sig.figma.com/img/899d/a6c3/da309e2e1a3e19969255777a2d407d7e?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DhNOqRKkWN0JZPGHNaHWWI01PGbfY~KskXywrNQLH4ClLdzv8MaMT4z-s22mdAUL~397moOSezuoNdMwqNpgPHnwC7AqasxO~N7iOHqQONtaYLMm4Odd5aFVVIWhln3YUv~stmKi20L62SAQ2aq6rt8kp1pXB9LaGGwIKWa~wc74N2OZi2b~KnI4ByWE5CyxH-0xE9dEAXmyGTFEclSGXS8JrOYxFO4DsdkcX1B-MP~jlQJdmwv2TGMdJHhn5Z9OehUw4M8srZaea4zwr-g~H50~BOECKuMrf5yS~0LnyJvjRiqMtImtl2A2kQLWlphc8qdrXwQmRL7LUvFm3RDBkg__"
                alt="Contact Us"
                className="w-full rounded-lg"
                />
                <div>
                <div className="mb-6">
                    <h3 className="text-[#4E4E4E] font-semibold text-lg mb-2">OUR STORE</h3>
                    <p className="text-[#6D6D6D]">54709 Willms Station</p>
                    <p className="text-[#6D6D6D]">Suite 350, Washington, USA</p>
                    <p className="text-[#6D6D6D]">Tel: (415) 555-0132</p>
                    <p className="text-[#6D6D6D]">Email: greatstackdev@gmail.com</p>
                </div>
                
                <div>
                    <h3 className="font-semibold text-lg text-[#4E4E4E] mb-2">CAREERS AT FOREVER</h3>
                    <p className="text-[#6D6D6D] mb-4">Learn more about our teams and job openings.</p>
                    <button className="border border-black px-4 py-2 hover:bg-gray-200">
                    Explore Jobs
                    </button>
                </div>
                </div>
            </div>
            </div>
    )
}   

export default ContactUs 