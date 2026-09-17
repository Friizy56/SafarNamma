import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth, isAdminEmail } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // 1. Decode the token Google gives us
      const decodedToken: any = jwtDecode(credentialResponse.credential);
      const userEmail = decodedToken.email;

      // 2. Check the domain restriction
      if (!userEmail.endsWith('@sst.scaler.com')) {
        setError('Access denied. Please use your @sst.scaler.com email address.');
        return;
      }

      // 3. Principle of Least Privilege: Default to 'user'.
      // Only grant 'admin' if the user's email is explicitly in the authorized admin list.
      const assignedRole = isAdminEmail(userEmail) ? ('admin' as const) : ('user' as const);

      const user = {
        id: decodedToken.sub,
        email: userEmail,
        name: decodedToken.name,
        avatar_url: decodedToken.picture || undefined,
        role: assignedRole,
        created_at: new Date().toISOString()
      };
      
      await login(user, credentialResponse.credential);
      navigate(from, { replace: true });
      
    } catch (err) {
      setError('Failed to process Google login.');
    }
  };


  return (
    <div className="flex-grow flex items-center justify-center bg-[#faf9f6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#f5f0e6] text-[#1a4731] flex items-center justify-center rounded-2xl mb-4">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Student Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in using your SST Scaler email
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            {/* The Google Button */}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed')}
              useOneTap
            />
          </div>
        </div>
      </div>
    </div>
  );
};
