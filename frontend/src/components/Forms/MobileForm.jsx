import { useState, useEffect } from 'react';
import { mobileAPI } from '../../services/api';
import Button from '../Common/Button';
import Input from '../Common/Input';

// IMEI Validation (matching backend logic)
function validateIMEI(imei) {
  if (!imei) {
    return { valid: false, error: 'IMEI is required' };
  }

  const imeiStr = String(imei).trim().replace(/\s/g, '');

  if (!/^\d+$/.test(imeiStr)) {
    return { valid: false, error: 'IMEI must contain only digits' };
  }

  if (imeiStr.length !== 15 && imeiStr.length !== 14) {
    return { valid: false, error: `IMEI must be 15 digits (got ${imeiStr.length})` };
  }

  if (imeiStr.length === 15 && !luhnCheck(imeiStr)) {
    return { valid: false, error: 'Invalid IMEI checksum (failed Luhn algorithm)' };
  }

  return { valid: true, error: null };
}

function luhnCheck(num) {
  let sum = 0;
  let isEven = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export default function MobileForm({ mobile, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    imei: '',
    purchasePrice: '',
    sellingPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    color: '',
    storage: '',
    condition: 'new',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mobile) {
      setFormData({
        brand: mobile.brand || '',
        model: mobile.model || '',
        imei: mobile.imei || '',
        purchasePrice: mobile.purchasePrice || '',
        sellingPrice: mobile.sellingPrice || '',
        purchaseDate: mobile.purchaseDate || new Date().toISOString().split('T')[0],
        supplier: mobile.supplier || '',
        color: mobile.color || '',
        storage: mobile.storage || '',
        condition: mobile.condition || 'new',
        notes: mobile.notes || ''
      });
    }
  }, [mobile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time IMEI validation
    if (name === 'imei' && value) {
      const validation = validateIMEI(value);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, imei: validation.error }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    const imeiValidation = validateIMEI(formData.imei);
    if (!imeiValidation.valid) {
      newErrors.imei = imeiValidation.error;
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    if (parseFloat(formData.sellingPrice) < parseFloat(formData.purchasePrice)) {
      newErrors.sellingPrice = 'Selling price must be greater than purchase price';
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
      if (mobile) {
        await mobileAPI.update(mobile.id, formData);
        alert('Mobile updated successfully');
      } else {
        await mobileAPI.create(formData);
        alert('Mobile added successfully');
      }
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Operation failed';
      alert(errorMessage);

      // If it's an IMEI duplicate error, set the error on the field
      if (errorMessage.toLowerCase().includes('imei')) {
        setErrors(prev => ({ ...prev, imei: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          error={errors.brand}
          required
        />
        <Input
          label="Model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          error={errors.model}
          required
        />
      </div>

      <Input
        label="IMEI (15 digits)"
        name="imei"
        value={formData.imei}
        onChange={handleChange}
        error={errors.imei}
        placeholder="123456789012345"
        maxLength="15"
        required
        disabled={!!mobile} // Can't change IMEI when editing
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Purchase Price (Rs)"
          name="purchasePrice"
          type="number"
          step="0.01"
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
          value={formData.sellingPrice}
          onChange={handleChange}
          error={errors.sellingPrice}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Purchase Date"
          name="purchaseDate"
          type="date"
          value={formData.purchaseDate}
          onChange={handleChange}
        />
        <Input
          label="Color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          placeholder="e.g., Black, White"
        />
        <Input
          label="Storage"
          name="storage"
          value={formData.storage}
          onChange={handleChange}
          placeholder="e.g., 128GB"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition <span className="text-red-500">*</span>
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="input"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>
        <Input
          label="Supplier"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          placeholder="Supplier name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="input"
          placeholder="Additional notes..."
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
          {mobile ? 'Update Mobile' : 'Add Mobile'}
        </Button>
      </div>
    </form>
  );
}
