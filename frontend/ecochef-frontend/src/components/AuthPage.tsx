import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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
  const [isLoading, setIsLoading] = useState(false);
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
    console.log('Form submission initiated');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        await login(formData.email, formData.password);
        console.log('Login successful - redirecting to dashboard');
        window.location.href = '/dashboard';
      } else {
        console.log('Attempting registration for:', formData.email);
        const response = await axios.post(
          '/api/register',
          {
            name: formData.name,
            email: formData.email,
            password: formData.password
          }
        );
        console.log('Registration response:', response.data);
        alert('Registration successful! Please log in.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Authentication failed. Please try again.';
      
      setErrors({
        ...errors,
        email: errorMessage,
        password: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['🌱', '🍃', '🥦', '🥬', '🥒', '🍏', '🌿', '🫑'].map((emoji, index) => (
          <div 
            key={index}
            className="absolute text-2xl opacity-20 animate-float"
            style={{
              top: `${10 + (index * 10)}%`,
              left: `${5 + (index * 10)}%`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Auth card */}
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md z-10">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          {isLogin ? 'Welcome to EcoChef' : 'Create Your Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 rounded-lg text-white font-medium transition-all ${isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-green-600 hover:text-green-800 font-medium focus:outline-none"
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </form>
      </div>

      {/* Add this to your CSS file */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;