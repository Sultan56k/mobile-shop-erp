import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MobileList from './pages/Mobiles/MobileList';
import AccessoryList from './pages/Accessories/AccessoryList';
import SaleList from './pages/Sales/SaleList';
import NewSale from './pages/Sales/NewSale';
import CustomerList from './pages/Customers/CustomerList';
import Reports from './pages/Reports/Reports';
import ChangePassword from './pages/Settings/ChangePassword';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mobiles" element={<ProtectedRoute><MobileList /></ProtectedRoute>} />
          <Route path="/accessories" element={<ProtectedRoute><AccessoryList /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SaleList /></ProtectedRoute>} />
          <Route path="/sales/new" element={<ProtectedRoute><NewSale /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
