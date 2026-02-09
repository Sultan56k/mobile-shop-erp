import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { saleAPI } from '../../services/api';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';

export default function SaleList() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await saleAPI.getAll();
      setSales(response.data.data.sales);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Date',
      render: (row) => new Date(row.saleDate).toLocaleDateString()
    },
    {
      header: 'Customer',
      render: (row) => row.customer?.name || 'Walk-in Customer'
    },
    {
      header: 'Items',
      render: (row) => row.items?.length || 0
    },
    {
      header: 'Total Amount',
      render: (row) => `Rs ${parseFloat(row.totalAmount).toLocaleString()}`
    },
    {
      header: 'Profit',
      render: (row) => (
        <span className="text-green-600 font-medium">
          Rs {parseFloat(row.profit).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Payment',
      render: (row) => (
        <span className="badge badge-info capitalize">{row.paymentMethod.replace('_', ' ')}</span>
      )
    },
    {
      header: 'By',
      render: (row) => row.creator?.fullName || row.creator?.username
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
          <p className="text-gray-500">View all sales transactions</p>
        </div>
        <Button onClick={() => navigate('/sales/new')}>
          <Plus className="w-5 h-5 mr-2" />
          New Sale
        </Button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <Table columns={columns} data={sales} emptyMessage="No sales found" />
        )}
      </div>
    </div>
  );
}
