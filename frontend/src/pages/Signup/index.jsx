import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import './Signup.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name || !email || !password) {
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
      setLoading(true);
      console.log('Attempting registration for:', { name, email });
      const response = await authService.register({ name, email, password });
      console.log('Registration response:', response);
      
      // Save user data with token (auto-login after registration)
      const userData = {
        userId: response.user.userId,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        token: response.token
      };

      console.log('Saving user data:', userData);
      login(userData);
      navigate('/marketplace');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="signup-container">
      <div className="signup-form-wrapper">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join the campus marketplace</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;