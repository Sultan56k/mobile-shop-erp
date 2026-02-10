import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { Smartphone, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDefaultCreds, setShowDefaultCreds] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 md:p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-100 p-3 rounded-full mb-3">
            <Smartphone className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Shop ERP</h1>
          <p className="text-gray-500 text-sm">Inventory & Sales Management</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            autoComplete="username"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!username || !password}
          >
            Sign In
          </Button>
        </form>

        {/* First-time setup help */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDefaultCreds(!showDefaultCreds)}
            className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
          >
            {showDefaultCreds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDefaultCreds ? 'Hide' : 'Show'} Default Credentials
          </button>

          {showDefaultCreds && (
            <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 font-semibold">First-Time Setup Only</p>
              </div>
              <p className="text-xs text-yellow-700 mb-2">Default credentials (change after first login):</p>
              <div className="bg-white rounded p-2 border border-yellow-200">
                <p className="text-xs text-gray-700">Username: <span className="font-mono font-semibold">admin</span></p>
                <p className="text-xs text-gray-700">Password: <span className="font-mono font-semibold">admin123</span></p>
              </div>
              <p className="text-xs text-yellow-700 mt-2 font-medium">
                ⚠️ Change your password immediately after logging in!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
