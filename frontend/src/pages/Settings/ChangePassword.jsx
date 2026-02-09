import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import { Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = {
      0: { label: 'Too Weak', color: 'bg-red-500' },
      1: { label: 'Weak', color: 'bg-red-500' },
      2: { label: 'Weak', color: 'bg-orange-500' },
      3: { label: 'Fair', color: 'bg-yellow-500' },
      4: { label: 'Good', color: 'bg-blue-500' },
      5: { label: 'Strong', color: 'bg-green-500' },
      6: { label: 'Very Strong', color: 'bg-green-600' }
    };

    return { strength, ...levels[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setShowSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';

      if (errorMessage.includes('Current password')) {
        setErrors({ currentPassword: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="card">
          <div className="card-body text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed Successfully!</h2>
            <p className="text-gray-600 mb-4">Your password has been updated.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
        <p className="text-gray-500">Update your account password</p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Security Best Practices</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use at least 8 characters (12+ recommended)</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include numbers and special characters</li>
              <li>• Don't use common words or personal information</li>
              <li>• Never share your password with anyone</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Current Password */}
            <div>
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                placeholder="Enter your current password"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* New Password */}
            <div>
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                placeholder="Enter new password"
                required
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength <= 2 ? 'text-red-600' :
                      passwordStrength.strength <= 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
                required
                autoComplete="new-password"
              />

              {/* Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Additional Security Tips */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Password Requirements</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            {formData.newPassword.length >= 8 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            At least 8 characters
          </li>
          <li className="flex items-center gap-2">
            {/[A-Z]/.test(formData.newPassword) ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            At least one uppercase letter
          </li>
          <li className="flex items-center gap-2">
            {/[a-z]/.test(formData.newPassword) ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            At least one lowercase letter
          </li>
          <li className="flex items-center gap-2">
            {/[0-9]/.test(formData.newPassword) ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            At least one number
          </li>
          <li className="flex items-center gap-2">
            {/[^a-zA-Z0-9]/.test(formData.newPassword) ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            At least one special character (!@#$%^&*)
          </li>
        </ul>
      </div>
    </div>
  );
}
