import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { accessoryAPI } from '../../services/api';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import AccessoryForm from '../../components/Forms/AccessoryForm';
import { useAuth } from '../../contexts/AuthContext';

export default function AccessoryList() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchAccessories();
  }, [categoryFilter]);

  const fetchAccessories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (search) {
        params.search = search;
      }

      const response = await accessoryAPI.getAll(params);
      setAccessories(response.data.data.accessories);
    } catch (error) {
      console.error('Failed to fetch accessories:', error);
      alert('Failed to fetch accessories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAccessories();
  };

  const handleDelete = async (accessory) => {
    if (!confirm(`Are you sure you want to delete ${accessory.name}?`)) {
      return;
    }

    try {
      await accessoryAPI.delete(accessory.id);
      alert('Accessory deleted successfully');
      fetchAccessories();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete accessory');
    }
  };

  const handleEdit = (accessory) => {
    setSelectedAccessory(accessory);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedAccessory(null);
    fetchAccessories();
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Brand',
      render: (row) => row.brand || '-'
    },
    {
      header: 'Quantity',
      render: (row) => (
        <span className={row.quantity <= row.reorderLevel ? 'text-red-600 font-semibold' : ''}>
          {row.quantity}
        </span>
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
      header: 'Stock Status',
      render: (row) => (
        <span className={`badge ${row.quantity <= row.reorderLevel ? 'badge-danger' : 'badge-success'}`}>
          {row.quantity <= row.reorderLevel ? 'Low Stock' : 'In Stock'}
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
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {isAdmin() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="text-red-600 hover:text-red-800"
              title="Delete"
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
          <h2 className="text-2xl font-bold text-gray-900">Accessories</h2>
          <p className="text-gray-500">Manage accessory inventory</p>
        </div>
        <Button
          onClick={() => {
            setSelectedAccessory(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Accessory
        </Button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, category, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-48"
            >
              <option value="all">All Categories</option>
              <option value="Charger">Charger</option>
              <option value="Handsfree">Handsfree</option>
              <option value="Earphones">Earphones</option>
              <option value="Cover">Cover</option>
              <option value="Screen Protector">Screen Protector</option>
              <option value="Cable">Cable</option>
              <option value="Power Bank">Power Bank</option>
              <option value="Other">Other</option>
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
            data={accessories}
            emptyMessage="No accessories found"
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAccessory(null);
        }}
        title={selectedAccessory ? 'Edit Accessory' : 'Add New Accessory'}
        size="lg"
      >
        <AccessoryForm
          accessory={selectedAccessory}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedAccessory(null);
          }}
        />
      </Modal>
    </div>
  );
}
