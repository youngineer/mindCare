
import {logout} from '../services/authServices'

const Navbar = () => {

    const handleLogout = async() => {
        logout();
    }

  return (
    <div>
        <div className="navbar bg-base-100 shadow-sm bg-neutral text-neutral-content">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">mindCare</a>
            </div>
            <div className="flex gap-2">
                <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                    <img
                        alt="user profile photo"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                </div>
                <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    <li>
                    <button className="justify-between">
                        Profile
                        <span className="badge">New</span>
                    </button>
                    </li>
                    <li>
                        <button onClick={handleLogout}>Logout</button>
                    </li>
                </ul>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar