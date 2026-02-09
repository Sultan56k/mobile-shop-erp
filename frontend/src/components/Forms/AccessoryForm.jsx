import { useState, useEffect } from 'react';
import { accessoryAPI } from '../../services/api';
import Button from '../Common/Button';
import Input from '../Common/Input';

const CATEGORIES = [
  'Charger',
  'Handsfree',
  'Earphones',
  'Cover',
  'Screen Protector',
  'Cable',
  'Power Bank',
  'Memory Card',
  'Bluetooth Speaker',
  'Car Holder',
  'Selfie Stick',
  'Other'
];

export default function AccessoryForm({ accessory, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Charger',
    brand: '',
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    reorderLevel: '5',
    supplier: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessory) {
      setFormData({
        name: accessory.name || '',
        category: accessory.category || 'Charger',
        brand: accessory.brand || '',
        quantity: accessory.quantity || '',
        purchasePrice: accessory.purchasePrice || '',
        sellingPrice: accessory.sellingPrice || '',
        reorderLevel: accessory.reorderLevel || '5',
        supplier: accessory.supplier || '',
        description: accessory.description || ''
      });
    }
  }, [accessory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }

    if (parseFloat(formData.sellingPrice) < parseFloat(formData.purchasePrice)) {
      newErrors.sellingPrice = 'Selling price must be greater than or equal to purchase price';
    }

    if (!formData.reorderLevel || parseInt(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = 'Valid reorder level is required';
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
      // Convert string values to numbers
      const dataToSubmit = {
        ...formData,
        quantity: parseInt(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        reorderLevel: parseInt(formData.reorderLevel)
      };

      if (accessory) {
        await accessoryAPI.update(accessory.id, dataToSubmit);
        alert('Accessory updated successfully');
      } else {
        await accessoryAPI.create(dataToSubmit);
        alert('Accessory added successfully');
      }
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Operation failed';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g., Fast Charger 25W"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`input ${errors.category ? 'input-error' : ''}`}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Brand (Optional)"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="e.g., Samsung, Anker"
        />

        <Input
          label="Quantity in Stock"
          name="quantity"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Purchase Price (Rs)"
          name="purchasePrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.purchasePrice}
          onChange={handleChange}
          error={errors.purchasePrice}
          required
        />

        <Input
          label="Selling Price (Rs)"
          name="sellingPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.sellingPrice}
          onChange={handleChange}
          error={errors.sellingPrice}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Reorder Level"
          name="reorderLevel"
          type="number"
          min="0"
          value={formData.reorderLevel}
          onChange={handleChange}
          error={errors.reorderLevel}
          placeholder="Alert when stock is below this"
          required
        />

        <Input
          label="Supplier (Optional)"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          placeholder="Supplier name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="input"
          placeholder="Additional details about the product..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {accessory ? 'Update Accessory' : 'Add Accessory'}
        </Button>
      </div>
    </form>
  );
}
