import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import './Signup.css';

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
    const emailRegex = /^[^S@]+@[^S@]+\.[^S@]+$/;
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
    <div className="signup-container">
      <div className="signup-form-wrapper">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join the campus marketplace</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="signup-form" onSubmit={handleSubmit}>
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
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
