import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-core.js'; // <-- thêm .js cho chắc chắn
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    // 1) Thử login qua backend (nếu bạn đã bật /api/auth/login)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const me = await res.json(); // { id, username, role, name }
        login(me);
        navigate('/marketplace');
        return;
      }
    } catch {
      // Bỏ qua, dùng fallback bên dưới
    }

    // 2) Fallback demo (không cần backend):
    // - admin duy nhất: admin / admin123  -> role 'admin'
    // - còn lại: role 'user'
    if (username === 'admin' && password === 'admin123') {
      login({ id: 'admin', username: 'admin', role: 'admin', name: 'Admin' });
      navigate('/marketplace');
    } else {
      login({ id: Date.now().toString(), username, role: 'user', name: username });
      navigate('/marketplace');
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
}
