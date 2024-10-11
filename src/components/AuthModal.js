import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Sign In</h2>
        <p>Sign in with your Google account to continue searching recipes.</p>
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          onSuccess={(credentialResponse) => {
            onLogin(credentialResponse.credential);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
          useOneTap
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          logo_alignment="center"
          width="300"
        />
      </div>
    </div>
  );
};

export default AuthModal;
