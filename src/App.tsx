import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MenuView from "./pages/MenuView";
import MenuTemplateEditor from "./components/MenuTemplateEditor";

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<MenuView />} />
        <Route path="/menu/:date" element={<MenuView />} />
        <Route path="/kiosk" element={<MenuView />} />
        <Route path="/templates" element={<MenuTemplateEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
