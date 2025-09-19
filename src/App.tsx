import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MenuKiosk from "./pages/MenuKiosk";
import DayMenuView from "./pages/DayMenuView";

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<MenuKiosk />} />
        <Route path="/menu/:date" element={<DayMenuView />} />
        <Route path="/kiosk" element={<MenuKiosk />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
