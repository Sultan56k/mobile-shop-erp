import { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import SecurityWarning from '../components/Common/SecurityWarning';
import {
  DollarSign,
  TrendingUp,
  Smartphone,
  Package,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Security Warning */}
      <SecurityWarning />

      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm md:text-base text-gray-500">Overview of your shop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard
          title="Today's Sales"
          value={`Rs ${parseFloat(stats?.today?.sales || 0).toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Today's Profit"
          value={`Rs ${parseFloat(stats?.today?.profit || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Mobiles in Stock"
          value={stats?.inventory?.mobilesInStock || 0}
          icon={Smartphone}
          color="purple"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.inventory?.lowStockAccessories || 0}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Summary</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Mobiles in Stock</span>
              <span className="font-semibold text-gray-900">{stats?.inventory?.mobilesInStock}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Mobiles Sold</span>
              <span className="font-semibold text-gray-900">{stats?.inventory?.mobilesSold}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Inventory Value</span>
              <span className="font-semibold text-gray-900">
                Rs {parseFloat(stats?.inventory?.totalValue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Sales */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales (Last 7 Days)</h3>
          </div>
          <div className="card-body">
            {stats?.weeklySales?.length > 0 ? (
              <div className="space-y-3">
                {stats.weeklySales.slice(0, 7).map((day, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">
                      {new Date(day.saleDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Rs {parseFloat(day.total || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600">
                        Profit: Rs {parseFloat(day.profit || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No sales data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className="card">
      <div className="card-body p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-gray-500 mb-1 truncate">{title}</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{value}</p>
          </div>
          <div className={`${colors[color]} p-2 md:p-3 rounded-lg flex-shrink-0`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
