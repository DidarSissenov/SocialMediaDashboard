import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:3000/api/auth/register', formData);
      console.log("Registration successful", response.data);

      // Redirect to login page after successful registration
      navigate('/login');
      
    } catch (err) {
      console.error("Error object:", err);
      if (err.response) {
        console.error("Error message:", err.message);
        setError(err.message); // Update the state to display error message
      }
    }
  };

  return (
    <div className="auth-form">
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Username" 
                name="username"
                value={formData.username} 
                onChange={handleChange} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                name="password"
                value={formData.password} 
                onChange={handleChange} 
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Register</button>
        </form>
    </div>
  );
}

export default Register;
