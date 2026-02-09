import { Accessory } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get all accessories with filters
 * GET /api/accessories
 */
export async function getAllAccessories(req, res) {
  try {
    const { category, lowStock, search, page = 1, limit = 50 } = req.query;

    // Build query conditions
    const where = {};

    if (category) {
      where.category = category;
    }

    if (lowStock === 'true') {
      // Find accessories where quantity <= reorderLevel
      where[Op.or] = [
        { quantity: { [Op.lte]: Mobile.sequelize.col('reorderLevel') } }
      ];
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } }
      ];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Accessory.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        accessories: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get accessories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accessories'
    });
  }
}

/**
 * Get accessory by ID
 * GET /api/accessories/:id
 */
export async function getAccessoryById(req, res) {
  try {
    const { id } = req.params;

    const accessory = await Accessory.findByPk(id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        error: 'Accessory not found'
      });
    }

    res.json({
      success: true,
      data: accessory
    });
  } catch (error) {
    console.error('Get accessory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accessory'
    });
  }
}

/**
 * Create new accessory
 * POST /api/accessories
 */
export async function createAccessory(req, res) {
  try {
    const accessoryData = req.body;

    const accessory = await Accessory.create(accessoryData);

    res.status(201).json({
      success: true,
      data: accessory,
      message: 'Accessory added successfully'
    });
  } catch (error) {
    console.error('Create accessory error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create accessory'
    });
  }
}

/**
 * Update accessory
 * PUT /api/accessories/:id
 */
export async function updateAccessory(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const accessory = await Accessory.findByPk(id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        error: 'Accessory not found'
      });
    }

    await accessory.update(updateData);

    res.json({
      success: true,
      data: accessory,
      message: 'Accessory updated successfully'
    });
  } catch (error) {
    console.error('Update accessory error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update accessory'
    });
  }
}

/**
 * Delete accessory
 * DELETE /api/accessories/:id
 */
export async function deleteAccessory(req, res) {
  try {
    const { id } = req.params;

    const accessory = await Accessory.findByPk(id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        error: 'Accessory not found'
      });
    }

    await accessory.destroy();

    res.json({
      success: true,
      message: 'Accessory deleted successfully'
    });
  } catch (error) {
    console.error('Delete accessory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete accessory'
    });
  }
}

/**
 * Get low stock accessories
 * GET /api/accessories/alerts/low-stock
 */
export async function getLowStockAccessories(req, res) {
  try {
    const accessories = await Accessory.findAll({
      where: Accessory.sequelize.where(
        Accessory.sequelize.col('quantity'),
        '<=',
        Accessory.sequelize.col('reorderLevel')
      ),
      order: [['quantity', 'ASC']]
    });

    res.json({
      success: true,
      data: accessories
    });
  } catch (error) {
    console.error('Get low stock accessories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock accessories'
    });
  }
}

/**
 * Get unique categories
 * GET /api/accessories/categories/list
 */
export async function getCategories(req, res) {
  try {
    const categories = await Accessory.findAll({
      attributes: [[Accessory.sequelize.fn('DISTINCT', Accessory.sequelize.col('category')), 'category']],
      raw: true
    });

    res.json({
      success: true,
      data: categories.map(c => c.category).filter(Boolean)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
}

export default {
  getAllAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getLowStockAccessories,
  getCategories
};
