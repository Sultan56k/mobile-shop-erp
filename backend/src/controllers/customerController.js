import { Customer, Sale } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get all customers
 * GET /api/customers
 */
export async function getAllCustomers(req, res) {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        customers: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
}

/**
 * Get customer by ID with purchase history
 * GET /api/customers/:id
 */
export async function getCustomerById(req, res) {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [{
        model: Sale,
        as: 'sales',
        order: [['saleDate', 'DESC']]
      }]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
}

/**
 * Create new customer
 * POST /api/customers
 */
export async function createCustomer(req, res) {
  try {
    const customerData = req.body;

    const customer = await Customer.create(customerData);

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer added successfully'
    });
  } catch (error) {
    console.error('Create customer error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
}

/**
 * Update customer
 * PUT /api/customers/:id
 */
export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    await customer.update(updateData);

    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Update customer error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
}

/**
 * Delete customer
 * DELETE /api/customers/:id
 */
export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check if customer has sales
    const salesCount = await Sale.count({ where: { customerId: id } });

    if (salesCount > 0) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete customer with existing sales records'
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
}

export default {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
