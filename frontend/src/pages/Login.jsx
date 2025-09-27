import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Book, Users, GraduationCap, Lock, User } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student profile management with batch organization"
    },
    {
      icon: GraduationCap,
      title: "Teacher Dashboard",
      description: "Powerful tools for educators to manage classes and track progress"
    },
    {
      icon: Book,
      title: "Academic Analytics",
      description: "Data-driven insights to improve educational outcomes"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(credentials.username, credentials.password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Features Carousel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap size={48} className="text-white" />
              <span className="ml-3 text-3xl font-bold">EduDemy</span>
            </div>
            <p className="text-blue-100 text-lg">Educational Management System</p>
          </div>
          
          <div className="max-w-md animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              {React.createElement(features[currentSlide].icon, { size: 64, className: "text-blue-200" })}
            </div>
            <h2 className="text-2xl font-semibold mb-4">{features[currentSlide].title}</h2>
            <p className="text-blue-100 leading-relaxed">{features[currentSlide].description}</p>
          </div>
          
          {/* Slide Indicators */}
          <div className="flex space-x-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-40'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap size={40} className="text-blue-600" />
              <span className="ml-3 text-2xl font-bold text-gray-800">EduDemy</span>
            </div>
            <p className="text-gray-600">Educational Management System</p>
          </div>
          
          <div className="card p-8 animate-slide-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Please sign in to your account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md animate-slide-up">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-primary py-3 text-lg font-semibold relative ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            
            {/* Registration Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Request Access
                </Link>
              </p>
            </div>
            
            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">Demo Credentials (Development Mode):</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-red-50 p-2 rounded-md">
                  <p className="font-semibold text-red-800">Super Admin</p>
                  <p className="text-red-600">superadmin / super123</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-md">
                  <p className="font-semibold text-blue-800">Admin</p>
                  <p className="text-blue-600">admin / admin123</p>
                </div>
                <div className="bg-green-50 p-2 rounded-md">
                  <p className="font-semibold text-green-800">Teacher</p>
                  <p className="text-green-600">teacher / teacher123</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mt-2">
                <div className="bg-purple-50 p-2 rounded-md">
                  <p className="font-semibold text-purple-800">Student</p>
                  <p className="text-purple-600">student / student123</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-md">
                  <p className="font-semibold text-orange-800">Management</p>
                  <p className="text-orange-600">management / demo123</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-md">
                  <p className="font-semibold text-indigo-800">Academics</p>
                  <p className="text-indigo-600">academics / demo123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
