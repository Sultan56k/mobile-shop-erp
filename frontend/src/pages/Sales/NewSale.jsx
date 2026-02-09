import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { saleAPI, mobileAPI, accessoryAPI, customerAPI } from '../../services/api';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

export default function NewSale() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [mobiles, setMobiles] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    paymentMethod: 'cash',
    saleDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: []
  });

  const [itemToAdd, setItemToAdd] = useState({
    itemType: 'mobile',
    itemId: '',
    quantity: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, mobilesRes, accessoriesRes] = await Promise.all([
        customerAPI.getAll({ limit: 100 }),
        mobileAPI.getAll({ status: 'in_stock', limit: 100 }),
        accessoryAPI.getAll({ limit: 100 })
      ]);

      setCustomers(customersRes.data.data.customers);
      setMobiles(mobilesRes.data.data.mobiles);
      setAccessories(accessoriesRes.data.data.accessories);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleAddItem = () => {
    if (!itemToAdd.itemId) {
      alert('Please select an item');
      return;
    }

    // Check if item already added
    const exists = formData.items.some(
      item => item.itemType === itemToAdd.itemType && item.itemId === itemToAdd.itemId
    );

    if (exists) {
      alert('Item already added');
      return;
    }

    // Get item details
    let itemDetails = null;
    if (itemToAdd.itemType === 'mobile') {
      itemDetails = mobiles.find(m => m.id === parseInt(itemToAdd.itemId));
    } else {
      itemDetails = accessories.find(a => a.id === parseInt(itemToAdd.itemId));
    }

    if (!itemDetails) {
      alert('Item not found');
      return;
    }

    // For accessories, check quantity
    if (itemToAdd.itemType === 'accessory' && itemDetails.quantity < itemToAdd.quantity) {
      alert(`Only ${itemDetails.quantity} units available`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...itemToAdd,
          itemId: parseInt(itemToAdd.itemId),
          name: itemToAdd.itemType === 'mobile'
            ? `${itemDetails.brand} ${itemDetails.model} (IMEI: ${itemDetails.imei})`
            : itemDetails.name,
          price: parseFloat(itemDetails.sellingPrice),
          quantity: itemToAdd.itemType === 'mobile' ? 1 : parseInt(itemToAdd.quantity)
        }
      ]
    }));

    // Reset item to add
    setItemToAdd({
      itemType: 'mobile',
      itemId: '',
      quantity: 1
    });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      await saleAPI.create(formData);
      alert('Sale created successfully!');
      navigate('/sales');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">New Sale</h2>
        <p className="text-sm md:text-base text-gray-500">Create a new sales transaction</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sale Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Sale Information</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="input"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Sale Date"
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="input"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Add Items */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Add Items</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4">
              <div className="w-full sm:w-32">
                <select
                  value={itemToAdd.itemType}
                  onChange={(e) => setItemToAdd({ ...itemToAdd, itemType: e.target.value, itemId: '' })}
                  className="input"
                >
                  <option value="mobile">Mobile</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>

              <div className="flex-1">
                <select
                  value={itemToAdd.itemId}
                  onChange={(e) => setItemToAdd({ ...itemToAdd, itemId: e.target.value })}
                  className="input text-sm md:text-base"
                >
                  <option value="">Select item...</option>
                  {itemToAdd.itemType === 'mobile' ? (
                    mobiles.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.brand} {m.model} (IMEI: {m.imei}) - Rs {m.sellingPrice}
                      </option>
                    ))
                  ) : (
                    accessories.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Stock: {a.quantity}) - Rs {a.sellingPrice}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex gap-2">
                {itemToAdd.itemType === 'accessory' && (
                  <div className="w-20 sm:w-24">
                    <Input
                      type="number"
                      min="1"
                      value={itemToAdd.quantity}
                      onChange={(e) => setItemToAdd({ ...itemToAdd, quantity: e.target.value })}
                      placeholder="Qty"
                    />
                  </div>
                )}

                <Button type="button" onClick={handleAddItem} className="flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-right">Rs {item.price.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-semibold">Total:</td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-primary-600">
                        Rs {calculateTotal().toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="input"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/sales')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Complete Sale
          </Button>
        </div>
      </form>
    </div>
  );
}
