import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getSalesReport(dateRange);
      setReport(response.data.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-500">Sales and inventory reports</p>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-4 items-end">
            <Input
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
            <Button onClick={fetchReport} loading={loading}>
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                Rs {parseFloat(report.summary.totalSales || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500 mb-1">Total Profit</p>
              <p className="text-2xl font-bold text-green-600">
                Rs {parseFloat(report.summary.totalProfit || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.summary.transactionCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      {report?.dailyBreakdown?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Daily Breakdown</h3>
          </div>
          <div className="card-body">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Sales</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Profit</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.dailyBreakdown.map((day, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">
                      {new Date(day.saleDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      Rs {parseFloat(day.totalSales || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-green-600">
                      Rs {parseFloat(day.totalProfit || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {day.transactionCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
