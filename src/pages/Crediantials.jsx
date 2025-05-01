import { useState } from 'react';
import "../components/styles/login.css"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleModeToggle = () => {
    setIsLogin(!isLogin);
  };
  
  return (
    <div className="login-container">
    <div className="form-container">
      {/* Header */}
      <h1 className="header">
        {isLogin ? 'Welcome back' : 'Create account'}
      </h1>
      
      {/* Form */}
      <form className="form">
        {/* Email */}
        <div className="input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="input-field"
            required
          />
        </div>
        
        {/* Password - Only shown based on state */}
        <div className={`input-group password-field ${isLogin ? 'hidden' : 'visible'}`}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-password"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Continue Button */}
        <button
          type="submit"
          className="submit-button"
        >
          Continue
        </button>
      </form>
      
      {/* Sign up / Login link */}
      <div className="toggle-link-container">
        {isLogin ? (
          <p>
            Don't have an account? 
            <button
              onClick={handleModeToggle}
              className="toggle-link"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account? 
            <button
              onClick={handleModeToggle}
              className="toggle-link"
            >
              Log in
            </button>
          </p>
        )}
      </div>
      
      {/* Divider */}
      <div className="divider">
        <div className="divider-line"></div>
        <span className="divider-text">OR</span>
        <div className="divider-line"></div>
      </div>
      
      {/* Social login buttons */}
      <div className="social-buttons">
        <button className="social-button">
          <svg className="social-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
          </svg>
          Continue with Google
        </button>
        
        <button className="social-button">
          <svg className="social-icon" viewBox="0 0 24 24">
            <path fill="#00A4EF" d="M11.4 24H0V12.6h11.4V24z" />
            <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z" />
            <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z" />
            <path fill="#7FBA00" d="M24 11.4H12.6V0H24v11.4z" />
          </svg>
          Continue with Microsoft Account
        </button>
        
        {/* <button className="social-button">
          <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.38 4.38 0 0 0-3 1.52 4.13 4.13 0 0 0-1 3 3.7 3.7 0 0 0 2.94-1.83zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91-.81 0-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.93 12.45 4.24 17 6 19.47c.8 1.21 1.8 2.58 3.12 2.53 1.25-.05 1.72-.8 3.24-.8s1.95.8 3.28.78c1.35-.05 2.22-1.23 3.06-2.43a10.88 10.88 0 0 0 1.38-2.85 4.42 4.42 0 0 1-2.62-4.07z" />
          </svg>
          Continue with Apple
        </button> */}
        
        <button className="social-button">
          <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 2.999a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1h11zm-5.499 14a1.5 1.5 0 1 0-.001 3.001 1.5 1.5 0 0 0 .001-3.001zm0-12.001a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z" />
          </svg>
          Continue with phone
        </button>
      </div>
    </div>
  </div>
  );
}