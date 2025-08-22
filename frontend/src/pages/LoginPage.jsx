import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import BgAnimation from '../components/shared/BgAnimation'; // ⬅️ import animation

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MANAGER'); // Default role
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Signing in...');

    try {
      const userData = await login(email, password, role);
      toast.success(`Welcome back, ${userData.name}!`, { id: toastId });

      navigate('/dashboard');

      if (userData.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/executive');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.', { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background Animation */}
      <BgAnimation />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-black/10 bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 grid place-items-center rounded-md border border-black/10 text-pran-red text-xl font-semibold tracking-tighter">
              <img src="./logo.png" alt="Logo" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-gray-medium">Sign in to access your dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-dark">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@pran.com"
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:ring-2 ring-pran-blue/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-dark">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:ring-2 ring-pran-blue/30"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-pran-red text-white px-4 py-2.5 text-sm font-medium tracking-tight hover:bg-[#b72828] focus:outline-none focus-visible:ring-2 ring-pran-red/40 transition disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-medium mt-4">
          If you don&apos;t have an account, please contact your manager.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
