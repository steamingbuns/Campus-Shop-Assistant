import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock, UserRound, Shield } from 'lucide-react';
import authService from '../../services/authService';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Additional validation for signup
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await authService.register({ name: username, email, password, role: 'seller' });
      alert('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      console.error(err);
    }
  };
  
  return (
    <div className="relative isolate mx-auto flex min-h-[75vh] max-w-4xl flex-col rounded-3xl bg-white/80 px-6 py-10 shadow-2xl shadow-blue-100 ring-1 ring-white/60 backdrop-blur lg:flex-row lg:px-10">
      <div className="lg:w-1/2">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
          <Shield className="h-4 w-4" />
          Verified campus sellers
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Create your account</h1>
        <p className="mt-2 text-base text-slate-600">
          Join the marketplace, list items fast, and connect with trusted students nearby.
        </p>
        {/* <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-500 p-4 text-white shadow-lg shadow-blue-200">
          <p className="text-sm font-semibold opacity-90">Perks for sellers</p>
          <ul className="mt-2 space-y-2 text-sm opacity-90">
            <li>• Instant listing creation</li>
            <li>• Smart chat assistant for buyers</li>
            <li>• Pickup scheduling on campus</li>
          </ul>
        </div> */}
      </div>

      <div className="mt-8 lg:mt-0 lg:w-1/2">
        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/80 p-6 shadow-sm shadow-blue-50 ring-1 ring-blue-50">
          <div className="space-y-2">
            <label htmlFor="username-input" className="text-sm font-semibold text-slate-800">Username</label>
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white/70 px-3 py-2 ring-blue-100 focus-within:ring-2 focus-within:ring-blue-500">
              <UserRound className="h-4 w-4 text-slate-400" />
              <input
                id="username-input"
                type="text"
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Choose a display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Sign up
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-700">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-600">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
