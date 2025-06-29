import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

async function handleSubmit(e) {
  e.preventDefault();

  const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });

  if (res.ok) {
    navigate("/login");
  } else {
    alert("Registration failed");
  }
}
  return (
    <div className="font-kino flex flex-col items-center min-h-[100dvh] overflow-hidden relative" style={{ backgroundColor: "#111111", color: "#ACACAC" }}>
      {/* Banner with overlay and higher fade */}
        <div className="relative w-full h-60">
        <img src="/banner.png" alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(17, 17, 17, 0.4)' }} />
        <div
            className="absolute bottom-0 left-0 w-full h-48"
            style={{ background: 'linear-gradient(to top, #111111, transparent)' }}
        />
        </div>

      <h1 className="text-5xl font-bold mt-6 mb-2 text-center" style={{ color: "#ACACAC" }}>Sign Up!</h1>
      <p className="text-sm font-extralight mb-6 text-center px-4" style={{ color: "#ACACAC" }}>
        Create an account to find<br />your perfect movie match
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm px-4 flex flex-col items-center">
        <div className="w-4/5">
          <label className="mb-1 text-sm font-extralight" style={{ color: "#ACACAC" }}>Email address</label>
          <input
            className="w-full bg-transparent border-b border-gray-500 py-2 mb-4 font-extralight outline-none"
            style={{ color: "#ACACAC" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="mb-1 text-sm font-extralight" style={{ color: "#ACACAC" }}>Username</label>
          <input
            className="w-full bg-transparent border-b border-gray-500 py-2 mb-4 font-extralight outline-none"
            style={{ color: "#ACACAC" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="mb-1 text-sm font-extralight" style={{ color: "#ACACAC" }}>Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent border-b border-gray-500 py-2 font-extralight outline-none pr-10"
              style={{ color: "#ACACAC" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src="/eye.png"
              alt="Toggle visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 w-5 h-5 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-4/5 bg-gray-700 py-3 rounded-full font-semibold hover:bg-gray-600"
          style={{ color: "white" }}
        >
          Create
        </button>

        <div className="text-center mt-4 text-sm font-extralight" style={{ color: "#ACACAC" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline" style={{ color: "white" }}>
            Log in!
          </Link>
        </div>
      </form>
    </div>
  );
}
