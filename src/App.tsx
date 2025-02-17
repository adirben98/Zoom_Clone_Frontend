

import './App.css'
import { Navigate, Route, Routes } from "react-router-dom"
import { v4 } from "uuid"
import Room from "./components/Room"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={`/${v4()}`}/>}/>
        <Route path="/:roomId" element={<Room/>}/>
      </Routes>
    </>
  )
}

export default App
