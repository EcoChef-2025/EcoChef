import React, { createContext, useContext, useState, type ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: { id: string; name: string; email: string; isAdmin: boolean } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
}

interface Recipe {
  id: string;
  title: string;
  prepTime: number;
  cookTime: number;
  dietaryTags: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; name: string; email: string; isAdmin: boolean } | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/login', { email, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setUser(response.data.user); // Expect { user: { id, name, email, isAdmin } }
      // Store token in localStorage (assuming backend returns it)
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIngredients([]);
    setRecipes([]);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, ingredients, setIngredients, recipes, setRecipes }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;