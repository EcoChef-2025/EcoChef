import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import RecipeDetail from './components/RecipeDetail';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';

function App() {
  // Simulate admin and user check (replace with real authentication later)
  const isAdmin = true; // For now, assume admin access
  const isLoggedIn = true; // For now, assume user is logged in

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
        {isLoggedIn && <Route path="/profile" element={<UserProfile />} />}
      </Routes>
    </Router>
  );
}

export default App;