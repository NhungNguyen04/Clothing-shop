const DeliveryInformation = () => {
    return (
        <div>
            <div className="flex items-center">
                <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">YOUR</span> CART</h2>
                <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
            </div>
            <form className="space-y-4">
            <div className="flex gap-4">
              <input type="text" placeholder="First name" className="w-1/2 p-3 border rounded-lg" />
              <input type="text" placeholder="Last name" className="w-1/2 p-3 border rounded-lg" />
            </div>
            <input type="email" placeholder="Email address" className="w-full p-3 border rounded-lg" />
            <input type="text" placeholder="Street" className="w-full p-3 border rounded-lg" />
            <div className="flex gap-4">
              <input type="text" placeholder="City" className="w-1/2 p-3 border rounded-lg" />
              <input type="text" placeholder="State" className="w-1/2 p-3 border rounded-lg" />
            </div>
            <div className="flex gap-4">
              <input type="text" placeholder="Zip code" className="w-1/2 p-3 border rounded-lg" />
              <input type="text" placeholder="Country" className="w-1/2 p-3 border rounded-lg" />
            </div>
            <input type="text" placeholder="Phone" className="w-full p-3 border rounded-lg" />
          </form>
        </div>
    )
}
export default DeliveryInformation