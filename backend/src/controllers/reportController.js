import { Sale, SaleItem, Mobile, Accessory } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

/**
 * Get dashboard overview statistics
 * GET /api/reports/dashboard
 */
export async function getDashboardStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Today's sales
    const todaySales = await Sale.sum('totalAmount', {
      where: {
        saleDate: today
      }
    }) || 0;

    const todayProfit = await Sale.sum('profit', {
      where: {
        saleDate: today
      }
    }) || 0;

    // Total mobiles in stock
    const mobilesInStock = await Mobile.count({
      where: { status: 'in_stock' }
    });

    // Total mobiles sold
    const mobilesSold = await Mobile.count({
      where: { status: 'sold' }
    });

    // Low stock accessories
    const lowStockAccessories = await Accessory.count({
      where: sequelize.where(
        sequelize.col('quantity'),
        '<=',
        sequelize.col('reorderLevel')
      )
    });

    // Total inventory value (mobiles + accessories)
    const mobilesValue = await Mobile.sum('purchasePrice', {
      where: { status: 'in_stock' }
    }) || 0;

    const accessoriesValue = await Accessory.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('purchasePrice * quantity')), 'totalValue']
      ],
      raw: true
    });

    const totalInventoryValue = parseFloat(mobilesValue) + parseFloat(accessoriesValue[0]?.totalValue || 0);

    // Recent sales (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklySales = await Sale.findAll({
      attributes: [
        'saleDate',
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total'],
        [sequelize.fn('SUM', sequelize.col('profit')), 'profit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        saleDate: {
          [Op.gte]: sevenDaysAgo.toISOString().split('T')[0]
        }
      },
      group: ['saleDate'],
      order: [['saleDate', 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        today: {
          sales: parseFloat(todaySales).toFixed(2),
          profit: parseFloat(todayProfit).toFixed(2)
        },
        inventory: {
          mobilesInStock,
          mobilesSold,
          lowStockAccessories,
          totalValue: parseFloat(totalInventoryValue).toFixed(2)
        },
        weeklySales
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
}

/**
 * Get sales report for date range
 * GET /api/reports/sales
 */
export async function getSalesReport(req, res) {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    const where = {
      saleDate: {
        [Op.between]: [startDate, endDate]
      }
    };

    // Get aggregated sales data
    const salesSummary = await Sale.findAll({
      attributes: [
        'saleDate',
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('profit')), 'totalProfit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount']
      ],
      where,
      group: ['saleDate'],
      order: [['saleDate', 'DESC']],
      raw: true
    });

    // Get total summary
    const totals = await Sale.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('profit')), 'totalProfit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount']
      ],
      where,
      raw: true
    });

    // Get top selling items
    const topItems = await SaleItem.findAll({
      attributes: [
        'itemType',
        'itemName',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue']
      ],
      include: [{
        model: Sale,
        as: 'sale',
        attributes: [],
        where
      }],
      group: ['itemType', 'itemId', 'itemName'],
      order: [[sequelize.fn('SUM', sequelize.col('totalPrice')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        summary: totals[0] || { totalSales: 0, totalProfit: 0, transactionCount: 0 },
        dailyBreakdown: salesSummary,
        topSellingItems: topItems
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sales report'
    });
  }
}

/**
 * Get profit report
 * GET /api/reports/profit
 */
export async function getProfitReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.saleDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get profit by item type
    const profitByType = await SaleItem.findAll({
      attributes: [
        'itemType',
        [sequelize.fn('SUM', sequelize.col('profit')), 'totalProfit'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('SaleItem.id')), 'itemCount']
      ],
      include: [{
        model: Sale,
        as: 'sale',
        attributes: [],
        where
      }],
      group: ['itemType'],
      raw: true
    });

    // Calculate profit margin
    const enrichedData = profitByType.map(item => ({
      ...item,
      profitMargin: item.totalRevenue > 0
        ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(2)
        : 0
    }));

    res.json({
      success: true,
      data: {
        profitByItemType: enrichedData
      }
    });
  } catch (error) {
    console.error('Get profit report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate profit report'
    });
  }
}

/**
 * Get inventory report
 * GET /api/reports/inventory
 */
export async function getInventoryReport(req, res) {
  try {
    // Mobiles summary
    const mobilesInStock = await Mobile.findAll({
      attributes: [
        'brand',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('purchasePrice')), 'purchaseValue'],
        [sequelize.fn('SUM', sequelize.col('sellingPrice')), 'sellingValue']
      ],
      where: { status: 'in_stock' },
      group: ['brand'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Accessories summary
    const accessoriesStock = await Accessory.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'productCount'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.literal('purchasePrice * quantity')), 'totalValue']
      ],
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      raw: true
    });

    // Low stock items
    const lowStock = await Accessory.findAll({
      where: sequelize.where(
        sequelize.col('quantity'),
        '<=',
        sequelize.col('reorderLevel')
      ),
      order: [['quantity', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        mobiles: mobilesInStock,
        accessories: accessoriesStock,
        lowStockItems: lowStock
      }
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate inventory report'
    });
  }
}

export default {
  getDashboardStats,
  getSalesReport,
  getProfitReport,
  getInventoryReport
};
