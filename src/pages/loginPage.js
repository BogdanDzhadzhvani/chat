import React, { useState } from "react";
import { useLoginUserMutation } from "../store/Api/authApi";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!login || !password) {
      setFormError("Login and password are required.");
      return;
    }

    try {
      setFormError("");

      const response = await loginUser({ login, password }).unwrap();

      localStorage.setItem("token", response.token);
      localStorage.setItem("login", response.payload.sub.login);
      localStorage.setItem("userId", response.payload.sub.id);
      navigate("/chat");
    } catch (err) {
      setFormError("Failed to login: " + (err.message || "Unknown error"));
    }
  };

  const handleNavigateToRegistration = () => {
    navigate("/registration");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-gray-700"
            >
              Login:
            </label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 text-gray-900 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </form>

        {isLoading && <p className="text-center text-gray-500">Loading...</p>}
        {formError && <p className="text-center text-red-500">{formError}</p>}

        <div className="text-center">
          <button
            onClick={handleNavigateToRegistration}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
