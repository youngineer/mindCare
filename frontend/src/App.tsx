import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import Body from "./components/Body"
import Auth from "./components/Auth"
import Dashboard from "./components/Dashboard"
import Tasks from "./components/Tasks"
import Chat from "./components/Chat"
import Bookings from "./components/Bookings"
import Moodlog from "./components/Moodlog"


function App() {

  return (
    <>
    <BrowserRouter basename="">
      <Routes>
        <Route path='/' element={<Body />}>
          <Route index path="/" element={<Navigate to="/auth" replace />}/>
          <Route path="/auth" element={<Auth/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/moodLogs" element={<Moodlog />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
