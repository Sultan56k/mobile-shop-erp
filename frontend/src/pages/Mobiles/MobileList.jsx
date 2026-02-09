import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { mobileAPI } from '../../services/api';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import MobileForm from '../../components/Forms/MobileForm';
import { useAuth } from '../../contexts/AuthContext';

export default function MobileList() {
  const [mobiles, setMobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMobile, setSelectedMobile] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchMobiles();
  }, [statusFilter]);

  const fetchMobiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (search) {
        params.search = search;
      }

      const response = await mobileAPI.getAll(params);
      setMobiles(response.data.data.mobiles);
    } catch (error) {
      console.error('Failed to fetch mobiles:', error);
      alert('Failed to fetch mobiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMobiles();
  };

  const handleDelete = async (mobile) => {
    if (!confirm(`Are you sure you want to delete ${mobile.brand} ${mobile.model}?`)) {
      return;
    }

    try {
      await mobileAPI.delete(mobile.id);
      alert('Mobile deleted successfully');
      fetchMobiles();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete mobile');
    }
  };

  const handleEdit = (mobile) => {
    setSelectedMobile(mobile);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedMobile(null);
    fetchMobiles();
  };

  const columns = [
    {
      header: 'Brand',
      accessor: 'brand'
    },
    {
      header: 'Model',
      accessor: 'model'
    },
    {
      header: 'IMEI',
      accessor: 'imei',
      render: (row) => (
        <span className="font-mono text-sm">{row.imei}</span>
      )
    },
    {
      header: 'Purchase Price',
      render: (row) => `Rs ${parseFloat(row.purchasePrice).toLocaleString()}`
    },
    {
      header: 'Selling Price',
      render: (row) => `Rs ${parseFloat(row.sellingPrice).toLocaleString()}`
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'in_stock' ? 'badge-success' : 'badge-warning'}`}>
          {row.status === 'in_stock' ? 'In Stock' : 'Sold'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          {isAdmin() && row.status === 'in_stock' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mobiles</h2>
          <p className="text-gray-500">Manage mobile phone inventory</p>
        </div>
        <Button
          onClick={() => {
            setSelectedMobile(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Mobile
        </Button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by brand, model, or IMEI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-48"
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="sold">Sold</option>
            </select>
            <Button type="submit">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <Table
            columns={columns}
            data={mobiles}
            emptyMessage="No mobiles found"
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedMobile(null);
        }}
        title={selectedMobile ? 'Edit Mobile' : 'Add New Mobile'}
        size="lg"
      >
        <MobileForm
          mobile={selectedMobile}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedMobile(null);
          }}
        />
      </Modal>
    </div>
  );
}
