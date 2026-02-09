import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Menu, Lock, ChevronDown, Settings } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangePassword = () => {
    setShowUserMenu(false);
    navigate('/change-password');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div>
            <h1 className="text-lg md:text-2xl font-bold text-primary-600">Mobile Shop ERP</h1>
            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Inventory & Sales Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* User Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            {/* Desktop User Info Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile User Icon Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="md:hidden flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info (Mobile) */}
                <div className="md:hidden px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  <p className="text-xs text-gray-400 mt-1">{user?.username}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Change Password</span>
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
