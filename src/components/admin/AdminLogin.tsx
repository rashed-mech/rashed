import React, { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, KeyRound, AlertCircle, Sparkles, Check , Eye, EyeOff } from 'lucide-react';
import { loginAdmin } from '../../api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginAdmin(username, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6" id="admin-login-page">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-2xl p-8 space-y-6" id="admin-login-card">
        {/* Top Back Link */}
        <button
          onClick={onBackToSite}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          id="back-to-portfolio-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Portfolio</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Portfolio Administration
          </h1>
          <p className="text-xs text-slate-400">
            Secure administrative route (<code className="text-indigo-300">/admin</code>) to manage portfolio contents, publications, and database records.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-start space-x-2 animate-fadeIn" id="login-error-alert">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" id="admin-login-form">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                id="admin-username-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                id="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            id="admin-login-submit-btn"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Access Admin Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
