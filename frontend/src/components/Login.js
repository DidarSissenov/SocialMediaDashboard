import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Login.css'; 


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:3000/api/auth/login', {
        username,
        password
      });
      localStorage.setItem('token', response.data);
      navigate('/dashboard');  // Navigate to the dashboard upon successful login
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Failed to login. Please check your credentials.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <button onClick={() => navigate('/register')} className="register-btn">
          Create a new account
        </button>
      </div>
    </div>
  );
}

export default Login;