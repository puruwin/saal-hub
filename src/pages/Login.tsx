import React from "react";
import LoginForm from "../components/LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <LoginForm />
    </div>
  );
}

