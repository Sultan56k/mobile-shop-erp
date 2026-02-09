import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { customerAPI } from '../../services/api';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import CustomerForm from '../../components/Forms/CustomerForm';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) {
        params.search = search;
      }

      const response = await customerAPI.getAll(params);
      setCustomers(response.data.data.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      alert('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleDelete = async (customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.name}?`)) {
      return;
    }

    try {
      await customerAPI.delete(customer.id);
      alert('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete customer');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
    fetchCustomers();
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Email',
      render: (row) => row.email || '-'
    },
    {
      header: 'Address',
      render: (row) => row.address ? (
        <span className="text-sm text-gray-600" title={row.address}>
          {row.address.substring(0, 30)}{row.address.length > 30 ? '...' : ''}
        </span>
      ) : '-'
    },
    {
      header: 'Registered',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
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
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-500">Manage customer records</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCustomer(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
            data={customers}
            emptyMessage="No customers found"
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="md"
      >
        <CustomerForm
          customer={selectedCustomer}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedCustomer(null);
          }}
        />
      </Modal>
    </div>
  );
}
