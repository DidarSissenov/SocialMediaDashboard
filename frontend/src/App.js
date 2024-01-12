import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PostScheduler from './components/PostScheduler';
import './styles/AuthForm.css';
import './styles/Dashboard.css';


/*
 * The main app component that sets up routing for the application.
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/post-scheduler" element={<PostScheduler />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
