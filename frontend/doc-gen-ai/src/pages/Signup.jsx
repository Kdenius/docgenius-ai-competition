import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Loader, Mail, Lock, User } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-200 to-dark-300 items-center justify-center p-12">
        <div className="max-w-xl text-center">
          <div className="mb-8 flex justify-center">
            <FileText size={80} className="text-primary-500" />
          </div>
          <h1 className="text-4xl font-bold mb-6 text-gradient">DocGenius AI</h1>
          <p className="text-xl text-slate-300 mb-8">
            Transform how you interact with documents. Get instant insights and answers from any document.
          </p>
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-dark-100/50 p-6 rounded-lg">
              <h3 className="font-semibold text-primary-400 text-lg mb-2">Multiple Formats</h3>
              <p className="text-slate-400">Support for PDFs, Word docs, text files, and HTML documents</p>
            </div>
            <div className="bg-dark-100/50 p-6 rounded-lg">
              <h3 className="font-semibold text-primary-400 text-lg mb-2">Chat History</h3>
              <p className="text-slate-400">All your document conversations saved for future reference</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <FileText size={48} className="text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gradient">DocGenius AI</h1>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-slate-100">Create your account</h2>
          <p className="text-slate-400 mb-8">Start your journey with DocGenius AI</p>
          
          {errorMsg && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md mb-6">
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  className="input pl-10"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;