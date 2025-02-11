import React from 'react'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <Outlet />
    </div>
  )
}

export default App
