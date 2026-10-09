import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email aur password fill karo.");
      return;
    }

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully! ✅");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful! ✅");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>🤖 AI Business OS</h1>

        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

        <p>
          {isSignup
            ? "Create your business account"
            : "Login to your business dashboard"}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Business Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          style={styles.switchButton}
        >
          {isSignup
            ? "Already have an account? Login"
            : "New business? Create account"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
  },

  card: {
    width: "380px",
    padding: "35px",
    background: "white",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    marginBottom: "14px",
    border: "1px solid #ddd",
    borderRadius: "9px",
  },

  button: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    background: "#6366f1",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  switchButton: {
    marginTop: "18px",
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#6366f1",
    cursor: "pointer",
  },
};

export default Login;