import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Home, Database } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">SQL to MongoDB</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link 
              to="/transform" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Database className="h-5 w-5" />
              <span>Transform</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}