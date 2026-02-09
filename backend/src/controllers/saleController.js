import { Sale, SaleItem, Mobile, Accessory, Customer, User } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

/**
 * Get all sales with filters
 * GET /api/sales
 */
export async function getAllSales(req, res) {
  try {
    const { startDate, endDate, customerId, page = 1, limit = 50 } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.saleDate = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.saleDate = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      where.saleDate = {
        [Op.lte]: endDate
      };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Sale.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: SaleItem,
          as: 'items'
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['saleDate', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        sales: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales'
    });
  }
}

/**
 * Get sale by ID
 * GET /api/sales/:id
 */
export async function getSaleById(req, res) {
  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: SaleItem,
          as: 'items'
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sale'
    });
  }
}

/**
 * Create new sale (with automatic stock updates)
 * POST /api/sales
 */
export async function createSale(req, res) {
  const t = await sequelize.transaction();

  try {
    const { customerId, items, paymentMethod, saleDate, notes } = req.body;

    // Validate input
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: 'At least one item is required'
      });
    }

    // Process each item and calculate totals
    let totalAmount = 0;
    let totalProfit = 0;
    const processedItems = [];

    for (const item of items) {
      const { itemType, itemId, quantity = 1 } = item;

      if (!itemType || !itemId) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: 'Each item must have itemType and itemId'
        });
      }

      if (itemType === 'mobile') {
        // Handle mobile sale
        const mobile = await Mobile.findByPk(itemId, { transaction: t });

        if (!mobile) {
          await t.rollback();
          return res.status(404).json({
            success: false,
            error: `Mobile with ID ${itemId} not found`
          });
        }

        if (mobile.status === 'sold') {
          await t.rollback();
          return res.status(400).json({
            success: false,
            error: `Mobile ${mobile.brand} ${mobile.model} (IMEI: ${mobile.imei}) is already sold`
          });
        }

        // Mark mobile as sold
        await mobile.update({ status: 'sold' }, { transaction: t });

        const itemProfit = parseFloat(mobile.sellingPrice) - parseFloat(mobile.purchasePrice);

        processedItems.push({
          itemType: 'mobile',
          itemId: mobile.id,
          itemName: `${mobile.brand} ${mobile.model} (IMEI: ${mobile.imei})`,
          quantity: 1,
          unitPrice: parseFloat(mobile.sellingPrice),
          totalPrice: parseFloat(mobile.sellingPrice),
          profit: itemProfit
        });

        totalAmount += parseFloat(mobile.sellingPrice);
        totalProfit += itemProfit;

      } else if (itemType === 'accessory') {
        // Handle accessory sale
        const accessory = await Accessory.findByPk(itemId, { transaction: t });

        if (!accessory) {
          await t.rollback();
          return res.status(404).json({
            success: false,
            error: `Accessory with ID ${itemId} not found`
          });
        }

        if (accessory.quantity < quantity) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for ${accessory.name}. Available: ${accessory.quantity}, Requested: ${quantity}`
          });
        }

        // Decrease stock
        await accessory.update(
          { quantity: accessory.quantity - quantity },
          { transaction: t }
        );

        const unitPrice = parseFloat(accessory.sellingPrice);
        const itemTotalPrice = unitPrice * quantity;
        const itemProfit = (parseFloat(accessory.sellingPrice) - parseFloat(accessory.purchasePrice)) * quantity;

        processedItems.push({
          itemType: 'accessory',
          itemId: accessory.id,
          itemName: accessory.name,
          quantity,
          unitPrice,
          totalPrice: itemTotalPrice,
          profit: itemProfit
        });

        totalAmount += itemTotalPrice;
        totalProfit += itemProfit;

      } else {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: `Invalid item type: ${itemType}`
        });
      }
    }

    // Create sale record
    const sale = await Sale.create({
      saleDate: saleDate || new Date(),
      customerId: customerId || null,
      totalAmount,
      profit: totalProfit,
      paymentMethod: paymentMethod || 'cash',
      createdBy: req.user.id,
      notes
    }, { transaction: t });

    // Create sale items
    for (const item of processedItems) {
      await SaleItem.create({
        saleId: sale.id,
        ...item
      }, { transaction: t });
    }

    // Commit transaction
    await t.commit();

    // Fetch complete sale with relations
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: SaleItem,
          as: 'items'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: completeSale,
      message: 'Sale created successfully'
    });

  } catch (error) {
    await t.rollback();
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sale'
    });
  }
}

/**
 * Delete sale (admin only - reverses stock updates)
 * DELETE /api/sales/:id
 */
export async function deleteSale(req, res) {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [{
        model: SaleItem,
        as: 'items'
      }]
    }, { transaction: t });

    if (!sale) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    // Reverse stock updates
    for (const item of sale.items) {
      if (item.itemType === 'mobile') {
        // Mark mobile as in_stock again
        await Mobile.update(
          { status: 'in_stock' },
          { where: { id: item.itemId }, transaction: t }
        );
      } else if (item.itemType === 'accessory') {
        // Increase stock back
        const accessory = await Accessory.findByPk(item.itemId, { transaction: t });
        if (accessory) {
          await accessory.update(
            { quantity: accessory.quantity + item.quantity },
            { transaction: t }
          );
        }
      }
    }

    // Delete sale items
    await SaleItem.destroy({ where: { saleId: id }, transaction: t });

    // Delete sale
    await sale.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Sale deleted successfully and stock restored'
    });

  } catch (error) {
    await t.rollback();
    console.error('Delete sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sale'
    });
  }
}

export default {
  getAllSales,
  getSaleById,
  createSale,
  deleteSale
};
