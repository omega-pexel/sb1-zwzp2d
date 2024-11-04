import React from 'react';
import { Database } from 'lucide-react';
import { DatabaseForm } from '../components/DatabaseForm/DatabaseForm';

export function DatabaseTransform() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <Database className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Database Transformation</h1>
        </div>
        <DatabaseForm />
      </div>
    </div>
  );
}