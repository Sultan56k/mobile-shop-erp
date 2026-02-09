import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';

export default function SecurityWarning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem('security-warning-dismissed') === 'true'
  );

  // Show warning if username is still "admin" (default)
  if (user?.username !== 'admin' || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem('security-warning-dismissed', 'true');
    setIsDismissed(true);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4 md:p-5 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="bg-yellow-400 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-900" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-yellow-900 mb-1">
            🔒 Security Alert: Change Your Password!
          </h3>
          <p className="text-sm md:text-base text-yellow-800 mb-3">
            You're using the default admin account. For security reasons, please change your password immediately.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleChangePassword}
              variant="primary"
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="secondary"
              size="sm"
            >
              Remind Me Later
            </Button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-yellow-700 hover:text-yellow-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
