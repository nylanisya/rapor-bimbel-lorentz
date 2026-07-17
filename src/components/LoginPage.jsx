import { useState } from "react";
import { loginStyles } from "../styles/loginStyles";
import { LOGIN_USERNAME, LOGIN_PASSWORD } from "../constants";

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
      setError("");
      onLoginSuccess();
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <div style={loginStyles.wrapper}>
      <form style={loginStyles.card} onSubmit={handleSubmit}>
        <div style={loginStyles.title}>Rapor Bimbel Lorentz</div>
        <div style={loginStyles.subtitle}>
          Masuk untuk mengelola rapor siswa
        </div>

        <label style={loginStyles.label}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={loginStyles.input}
          placeholder="Masukkan username"
          autoFocus
        />

        <label style={loginStyles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={loginStyles.input}
          placeholder="Masukkan password"
        />

        {error && <div style={loginStyles.error}>{error}</div>}

        <button type="submit" style={loginStyles.button}>
          Masuk
        </button>
      </form>
    </div>
  );
}
