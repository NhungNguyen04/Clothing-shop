const Spinner = () => {
  return (
    <div className="absolute top-0 left-0 flex justify-center items-center h-screen w-full bg-white">
      <div className="flex flex-row gap-2">
        <div className="w-4 h-4 rounded-full bg-black animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-black animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-black animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );
};

export default Spinner; 