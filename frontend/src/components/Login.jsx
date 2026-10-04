import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Eye } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { error: authContextError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/my-trainings');
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setLocalError('Invalid email or password.');
      } else {
        setLocalError('An error occurred during login.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setLocalError('Please enter your email address to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Please check your inbox.');
      setLocalError('');
    } catch (err) {
      console.error(err);
      setLocalError('Failed to send reset email. Please check if the email is correct.');
    }
  };

  const displayError = authContextError || localError;

  return (
    <div style={styles.container}>
      {/* Top Right Orange Shape */}
      <div style={styles.orangeShape}></div>

      {/* Bottom Blue Shape */}
      <div style={styles.blueShape}></div>

      {/* Login Card */}
      <div style={styles.card}>
        <h1 style={styles.logo}>
          Train<span style={styles.logoAccent}>U+</span>
        </h1>

        {displayError && (
          <div style={styles.error}>{displayError}</div>
        )}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <span style={styles.icon}><User size={16} color="#999" /></span>
          </div>

          <div style={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={styles.iconButton}
            >
             <Eye size={16} color="#999" />
            </button>
          </div>

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#0f2f52')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = '#123b66')
            }
          >
            LOGIN
          </button>
        </form>

        <p 
          style={{ ...styles.forgot, cursor: 'pointer', textDecoration: 'underline' }} 
          onClick={handleForgotPassword}
        >
          Forgot password?
        </p>

      </div>
    </div>
  );
};

const styles = {
 container: {
  height: '100vh',
  width: '100vw',         
  margin: 0,              
  padding: 0,              
  backgroundColor: '#f2f2f2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',       
  top: 0,
  left: 0,
  overflow: 'hidden',
  fontFamily: 'Segoe UI, sans-serif',
},
  orangeShape: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '60%',
    backgroundColor: '#f58220',
    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
  },

  blueShape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '35%',
    background: 'linear-gradient(135deg, #0d3b66 60%, #3a6ea5 100%)',
    clipPath: 'polygon(0 100%, 100% 40%, 100% 100%)',
  },

  card: {
    position: 'relative',
    zIndex: 1,
    width: '320px',
    textAlign: 'center',
  },

  logo: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: '30px',
  },

  logoAccent: {
    color: '#f58220',
  },

  inputGroup: {
    position: 'relative',
    marginBottom: '15px',
  },

  input: {
    width: '100%',
    padding: '12px 40px 12px 12px',
    border: 'none',
    borderBottom: '1px solid #ccc',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    boxSizing: 'border-box', 
    color: "#111",
  },

  icon: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    fontSize: '14px',
    color: '#999',
  },

  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#123b66',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxSizing: 'border-box',
  },

  forgot: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#1e3a5f',
    cursor: 'pointer',
  },

  error: {
    backgroundColor: '#ffd2d2',
    color: '#d8000c',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    fontSize: '13px',
  },

  iconButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
};

export default Login;