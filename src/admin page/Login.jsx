
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { username, password }
      );

      sessionStorage.setItem('adminToken', response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4
    bg-gradient-to-br from-[#080B1A] via-[#17143A] to-[#101D35]">

    {/* Login Card */}
    <div className="relative w-full max-w-md
      bg-white/[0.08] backdrop-blur-2xl
      border border-white/15 rounded-3xl
      shadow-[0_20px_80px_rgba(0,0,0,0.4)]
      p-8 sm:p-10">
      <h1 className="font-semibold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-3xl text-transparent">
        Unique Tailor </h1>

      <p className="text-center font-montserrat
        text-gray-300 mt-3 text-sm tracking-widest uppercase">
        Admin Login
      </p>

      <form onSubmit={handleLogin} className="mt-9 space-y-6">

        <div>
          <label className="block text-sm font-montserrat
            font-medium mb-2 text-gray-200">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
            className="w-full bg-white/10 border border-white/15
              text-white placeholder-gray-400 rounded-xl
              px-4 py-3 outline-none
              focus:border-cyan-400 focus:ring-2
              focus:ring-cyan-400/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-montserrat
            font-medium mb-2 text-gray-200">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            className="w-full bg-white/10 border border-white/15
              text-white placeholder-gray-400 rounded-xl
              px-4 py-3 outline-none
              focus:border-cyan-400 focus:ring-2
              focus:ring-cyan-400/20 transition-all"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r
            from-blue-600 via-indigo-600 to-purple-600
            hover:from-blue-500 hover:via-indigo-500
            hover:to-purple-500
            text-white font-montserrat font-semibold
            py-3.5 rounded-xl shadow-lg
            shadow-indigo-900/40
            transition-all duration-300
            hover:scale-[1.02]
            disabled:opacity-60">
          {loading ? 'Logging in...' : 'Login'}
        </button>

      </form>

      <p className="text-center font-montserrat
        text-xs text-gray-400 mt-8 tracking-wider">
        UNIQUE TAILOR · ADMIN PANEL
      </p>

    </div>
  </div>
);
}

export default Login;
