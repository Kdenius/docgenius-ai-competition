import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileText, Loader, CheckCircle, XCircle } from 'lucide-react';

const VerifyPage = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { token } = useParams(); // To get the token from the URL
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token exists and call API to verify the user
    if (token) {
      verifyUser(token);
    }
  }, [token]);

  const verifyUser = async (token) => {
    try {
      // Make the API call to verify the user
      const response = await fetch(import.meta.env.VITE_API_URL+`/verify/${token}`);
      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        localStorage.setItem('docgenius_user', JSON.stringify({ ...data.user, verified: true }));
        navigate('/dashboard');
      } else {
        setVerificationStatus('error');
        setErrorMsg(data.message || 'Failed to verify. Please try again.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMsg('An error occurred during verification. Please try again later.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center p-12">
        <div className="max-w-xl text-center">
          <div className="mb-8 flex justify-center">
            <FileText size={80} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-6 text-white text-shadow">DocGenius AI</h1>
          <p className="text-xl text-white mb-8 opacity-80">
            Your intelligent document assistant. Upload any document and get instant answers to your questions.
          </p>
        </div>
      </div>

      {/* Right Side - Verification Status */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-dark-200 p-8 rounded-lg shadow-lg">
          <div className="text-center mb-10 lg:hidden">
            <FileText size={48} className="text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white text-shadow">DocGenius AI</h1>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-slate-100">Email Verification</h2>
          <p className="text-slate-400 mb-8">
            {verificationStatus === null ? 'Verifying your account...' : 'Verification Status'}
          </p>
          
          {verificationStatus === 'success' && (
            <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <CheckCircle size={24} className="mr-2 text-green-500" />
                <p>Your account has been successfully verified!</p>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <XCircle size={24} className="mr-2 text-red-500" />
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {verificationStatus === null && (
            <div className="flex justify-center items-center">
              <Loader size={24} className="animate-spin mr-2" />
              Verifying...
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-400">
              If you have successfully verified, you can now go to your{' '}
              <Link to="/dashboard" className="text-primary-400 hover:text-primary-300 font-medium">
                Dashboard
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
