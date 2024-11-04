import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Zap, Shield, Brain } from 'lucide-react';

export function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Brain className="h-16 w-16 text-primary-600" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Transform Your SQL Database to MongoDB
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Seamlessly convert your SQL databases to MongoDB with our AI-powered transformation tool.
          Experience the power of modern database architecture.
        </p>
        <Link
          to="/transform"
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <span>Start Transformation</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Database className="h-12 w-12 text-primary-600 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Smart Schema Mapping</h2>
          <p className="text-gray-600 leading-relaxed">
            Our AI automatically detects and maps your SQL schema to MongoDB collections with intelligent field mapping and relationship preservation.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Zap className="h-12 w-12 text-primary-600 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI-Powered Conversion</h2>
          <p className="text-gray-600 leading-relaxed">
            Leverage advanced AI algorithms to optimize your data structure and ensure efficient MongoDB document design with best practices.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Shield className="h-12 w-12 text-primary-600 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Integrity</h2>
          <p className="text-gray-600 leading-relaxed">
            Maintain complete data integrity with comprehensive validation, error checking, and rollback capabilities throughout the process.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Modernize Your Database?</h2>
        <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
          Transform your SQL database to MongoDB in minutes, not days. Our AI-powered tool makes the process seamless and efficient.
        </p>
        <Link
          to="/transform"
          className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
        >
          <span>Start Free Transformation</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}