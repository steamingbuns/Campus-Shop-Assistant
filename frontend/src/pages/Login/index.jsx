import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token);
      navigate('/marketplace');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="relative isolate mx-auto flex min-h-[75vh] max-w-4xl flex-col rounded-3xl bg-white/80 px-6 py-10 shadow-2xl shadow-blue-100 ring-1 ring-white/60 backdrop-blur lg:flex-row lg:px-10">
      <div className="lg:w-1/2">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
          <LogIn className="h-4 w-4" />
          Welcome back
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Sign in to continue</h1>
        <p className="mt-2 text-base text-slate-600">
          Access your marketplace, manage orders, and stay in sync with campus deals.
        </p>

        <div className="mt-8 space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">1</span>
            Use your campus email for a verified experience.
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">2</span>
            Track pickups, chat with sellers.
          </div>
        </div>
      </div>

      <div className="mt-8 lg:mt-0 lg:w-1/2">
        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/80 p-6 shadow-sm shadow-blue-50 ring-1 ring-blue-50">
          <div className="space-y-2">
            <label htmlFor="email-input" className="text-sm font-semibold text-slate-800">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white/70 px-3 py-2 ring-blue-100 focus-within:ring-2 focus-within:ring-blue-500">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                id="email-input"
                type="email"
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="your.name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password-input" className="text-sm font-semibold text-slate-800">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white/70 px-3 py-2 ring-blue-100 focus-within:ring-2 focus-within:ring-blue-500">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                id="password-input"
                type="password"
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Login
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-700">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-500 hover:text-blue-600">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
