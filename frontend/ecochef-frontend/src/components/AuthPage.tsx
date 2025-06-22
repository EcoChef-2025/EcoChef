import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
  });
  const { login } = useAuth();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', name: '' };

    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (!isLogin && (!formData.name || formData.name.length < 2)) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await login(formData.email, formData.password);
        if (isLogin) {
          window.location.href = '/dashboard';
        } else {
          alert('Registration successful! Please log in.');
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '' });
        }
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({ ...errors, email: 'Invalid credentials or server issue' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <span className="animated-emoji emoji-1">🌱</span>
      <span className="animated-emoji emoji-2">🍃</span>
      <span className="animated-emoji emoji-3">🥦</span>
      <span className="animated-emoji emoji-4">🥬</span>
      <span className="animated-emoji emoji-5">🥒</span>
      <span className="animated-emoji emoji-6">🍏</span>
      <span className="animated-emoji emoji-7">🌿</span>
      <span className="animated-emoji emoji-8">🫑</span>
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-auto mt-10 sm:p-8 md:max-w-lg lg:max-w-xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-200 ease-in-out transform hover:-translate-y-1"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
          <p className="text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;