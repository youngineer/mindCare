import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import Body from "./components/Body"
import Auth from "./components/Auth"


function App() {

  return (
    <>
    <BrowserRouter basename="">
      <Routes>
        <Route path='/' element={<Body />}>
          <Route index path="/" element={<Navigate to="/auth" replace />}/>
          <Route path="/auth" element={<Auth/>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
