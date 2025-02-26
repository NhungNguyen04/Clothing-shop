const Orders = () => {
  const cart = [
    { id: 1, name: "Men Round Neck Pure Cotton T-shirt", price: 149, size: "L", quantity: 1, image: "https://via.placeholder.com/60", status: 'ready' },
    { id: 2, name: "Men Round Neck Pure Cotton T-shirt", price: 149, size: "L", quantity: 1, image: "https://via.placeholder.com/60", status: 'shipped' }
  ];
  const getStatusButton = (status) => {
    if (status === "ready") {
      return  ( <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="text-gray-800 font-medium">Ready to ship</span>
                </div>
              )
    }
    if (status === "shipped") {
      return  ( <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-gray-800 font-medium">Shipped</span>
                </div>
              )
    }
    return null;
  };
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
          <div className="flex items-center">
            <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">MY</span> ORDERS</h2>
            <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
          </div>
          <div className="mt-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b py-4">
                <div className="flex items-center">
                    <img src="https://m.yodycdn.com/fit-in/filters:format(webp)/products/ao-khoac-nam-yody-AKM7019-DE1%20(1).jpg" alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 ml-4">
                      <p className="text-[14px] text-[#494949]">{item.name}</p>
                      <div className="flex items-center mt-2">
                        <p className="text-[#494949]">${item.price}</p>
                        <p className="text-[#494949] ml-2 ">Quantity: 1</p>
                        <p className="text-[#494949] ml-2">Size: L</p>
                      </div>
                      <p className="text-[#494949] mt-2">Date: <span className="text-[#989898]">25, May, 2024</span></p>
                    </div>
                </div>
                <div className="mr-4">{getStatusButton(item.status)}</div>
                <div className="ml-4 cursor-pointer border border-[#BABABA] rounded-md py-2 px-4 ">
                  Track Order
                </div>
              </div>
            ))}
          </div>
        </div>
  )
}

export default Orders
