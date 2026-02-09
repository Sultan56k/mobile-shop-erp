import { Mobile } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get all mobiles with filters
 * GET /api/mobiles
 */
export async function getAllMobiles(req, res) {
  try {
    const { status, brand, search, page = 1, limit = 50 } = req.query;

    // Build query conditions
    const where = {};

    if (status) {
      where.status = status;
    }

    if (brand) {
      where.brand = brand;
    }

    if (search) {
      where[Op.or] = [
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { imei: { [Op.like]: `%${search}%` } }
      ];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Mobile.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        mobiles: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get mobiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobiles'
    });
  }
}

/**
 * Get mobile by ID
 * GET /api/mobiles/:id
 */
export async function getMobileById(req, res) {
  try {
    const { id } = req.params;

    const mobile = await Mobile.findByPk(id);

    if (!mobile) {
      return res.status(404).json({
        success: false,
        error: 'Mobile not found'
      });
    }

    res.json({
      success: true,
      data: mobile
    });
  } catch (error) {
    console.error('Get mobile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile'
    });
  }
}

/**
 * Get mobile by IMEI
 * GET /api/mobiles/imei/:imei
 */
export async function getMobileByIMEI(req, res) {
  try {
    const { imei } = req.params;

    const mobile = await Mobile.findOne({ where: { imei } });

    if (!mobile) {
      return res.status(404).json({
        success: false,
        error: 'Mobile with this IMEI not found'
      });
    }

    res.json({
      success: true,
      data: mobile
    });
  } catch (error) {
    console.error('Get mobile by IMEI error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile'
    });
  }
}

/**
 * Create new mobile
 * POST /api/mobiles
 */
export async function createMobile(req, res) {
  try {
    const mobileData = req.body;

    // Create mobile (validation happens automatically in model)
    const mobile = await Mobile.create(mobileData);

    res.status(201).json({
      success: true,
      data: mobile,
      message: 'Mobile added successfully'
    });
  } catch (error) {
    console.error('Create mobile error:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }

    // Handle unique constraint errors (duplicate IMEI)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'This IMEI already exists in the system'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create mobile'
    });
  }
}

/**
 * Update mobile
 * PUT /api/mobiles/:id
 */
export async function updateMobile(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const mobile = await Mobile.findByPk(id);

    if (!mobile) {
      return res.status(404).json({
        success: false,
        error: 'Mobile not found'
      });
    }

    // Don't allow updating sold mobiles
    if (mobile.status === 'sold' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot update sold mobiles'
      });
    }

    await mobile.update(updateData);

    res.json({
      success: true,
      data: mobile,
      message: 'Mobile updated successfully'
    });
  } catch (error) {
    console.error('Update mobile error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'This IMEI already exists in the system'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update mobile'
    });
  }
}

/**
 * Delete mobile
 * DELETE /api/mobiles/:id
 */
export async function deleteMobile(req, res) {
  try {
    const { id } = req.params;

    const mobile = await Mobile.findByPk(id);

    if (!mobile) {
      return res.status(404).json({
        success: false,
        error: 'Mobile not found'
      });
    }

    // Don't allow deleting sold mobiles
    if (mobile.status === 'sold') {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete sold mobiles. This would break sale records.'
      });
    }

    await mobile.destroy();

    res.json({
      success: true,
      message: 'Mobile deleted successfully'
    });
  } catch (error) {
    console.error('Delete mobile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete mobile'
    });
  }
}

/**
 * Get unique brands
 * GET /api/mobiles/brands/list
 */
export async function getBrands(req, res) {
  try {
    const brands = await Mobile.findAll({
      attributes: [[Mobile.sequelize.fn('DISTINCT', Mobile.sequelize.col('brand')), 'brand']],
      raw: true
    });

    res.json({
      success: true,
      data: brands.map(b => b.brand).filter(Boolean)
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brands'
    });
  }
}

export default {
  getAllMobiles,
  getMobileById,
  getMobileByIMEI,
  createMobile,
  updateMobile,
  deleteMobile,
  getBrands
};
