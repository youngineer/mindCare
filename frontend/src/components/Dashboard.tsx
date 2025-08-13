import { Link } from "react-router"


const Dashboard = () => {
  const isPatient = true;
  return (
    <div>
        <div>
          <div className="drawer">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              {/* Page content */}
              <label htmlFor="my-drawer" className="btn btn-primary drawer-button">Menu</label>
            </div>
            <div className="drawer-side">
              <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
              <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                {/* Sidebar content */}
                  <li><Link to={"/dashboard"}>Dashboard</Link></li>
                  <li><Link to={"/bookings"}>View Bookings</Link></li>
                  <li><Link to={"/chat"}>Chats</Link></li>
                {
                  isPatient && (
                    <div>
                      <li><Link to={"/summary"}>Summary</Link></li>
                      <li><Link to={"/tasks"}>Selfcare Tasks</Link></li>
                      <li><Link to={"/moodLogs"}>Selfcare Tasks</Link></li>
                    </div>
                  )
                }
              </ul>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Dashboard