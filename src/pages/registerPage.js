import React, { useState } from 'react';
import { useRegisterUserMutation, useLoginUserMutation } from '../store/Api/authApi'; 
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [registerUser, { isLoading: isRegistering, error: registerError }] = useRegisterUserMutation();
  const [loginUser, { isLoading: isLoggingIn, error: loginError }] = useLoginUserMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const registerResponse = await registerUser({ login, password }).unwrap();
      console.log("Register response:", registerResponse);

      const loginResponse = await loginUser({ login, password }).unwrap();
      console.log("Login response:", loginResponse);

      localStorage.setItem("token", loginResponse.token);
      localStorage.setItem("login", loginResponse.payload.sub.login);
      navigate("/chat");
    } catch (err) {
      console.error('Failed to register or login:', err);
    }
  };

  const handleNavigateToLogin = () => {
    navigate("/");
  };

  return (
    
      <div className="max-w-md mx-auto bg-white p-8 my-10 rounded-lg shadow-md">
        <h2 className="text-2xl mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="login" className="block text-sm font-medium text-gray-700">Login:</label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isRegistering || isLoggingIn}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Register
          </button>
        </form>
        <button
          onClick={handleNavigateToLogin}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Go to Login
        </button>
        {(isRegistering || isLoggingIn) && <p className="mt-4 text-center">Loading...</p>}
        {(registerError || loginError) && <p className="mt-4 text-center text-red-500">Error: {registerError?.data || loginError?.data}</p>}
      </div>
    
  );
};

export default RegisterPage;

