import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  
  const { token, loginUser } = useAuth();
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (token) {
      navigate("/recommendations");
    }
  }, [token, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (loginUser) {
        loginUser(data.token, name);
        navigate("/recommendations");
      } else {
        console.error("loginUser function missing from AuthContext");
      }
    } else {
      alert("Login failed");
    }
  }

  return (
    <div
      className="font-kino flex flex-col items-center min-h-[100dvh] overflow-hidden relative"
      style={{ backgroundColor: "#111111", color: "#ACACAC" }}
    >
      <div className="relative w-full h-60">
        <img src="/banner.png" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(17,17,17,0.4)" }} />
        <div
          className="absolute bottom-0 left-0 w-full h-48"
          style={{ background: "linear-gradient(to top, #111111, transparent)" }}
        />
      </div>

      <h1 className="text-5xl font-bold mt-6 mb-6" style={{ color: "#ACACAC" }}>
        Welcome back!
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm px-6 flex flex-col items-center"
      >
        <div className="w-4/5 flex flex-col mb-6">
          <label className="mb-1 text-sm font-extralight" style={{ color: "#ACACAC" }}>
            name
          </label>
          <input
            className="bg-transparent border-b border-gray-500 py-2 font-extralight outline-none"
            style={{ color: "#ACACAC" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="w-4/5 flex flex-col mb-2">
          <label className="mb-1 text-sm font-extralight" style={{ color: "#ACACAC" }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent border-b border-gray-500 py-2 font-extralight outline-none pr-10"
              style={{ color: "#ACACAC" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? "/closedeye.png" : "/eye.png"}
              alt="Toggle visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 w-5 h-5 cursor-pointer"
            />
          </div>
        </div>

        <div
          className="text-right text-xs font-normal mb-6 w-4/5"
          style={{ color: "#ACACAC" }}
        >
          <button type="button" className="text-[#ACACAC]">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-4/5 bg-gray-800 py-3 rounded-full font-semibold hover:bg-gray-700"
          style={{ color: "white" }}
        >
          Log in
        </button>

        <div
          className="text-center mt-4 text-sm font-extralight w-4/5"
          style={{ color: "#ACACAC" }}
        >
          Don’t have an account? {""}
          <Link to="/signup" className="font-semibold underline" style={{ color: "#ACACAC" }}>
            Sign Up!
          </Link>
        </div>
      </form>
    </div>
  );
}