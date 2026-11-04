import { Routes, Route, Navigate } from "react-router"
import Home from "@/pages/Home"
import L01 from "@/pages/L01"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/l01" element={<L01 />} />
      {/* Unknown URLs go back to the landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}