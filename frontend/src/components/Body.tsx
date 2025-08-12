import Navbar from './Navbar'
import Footer from './Footer'
import { Outlet } from 'react-router'

const Body = () => {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex justify-center py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Body