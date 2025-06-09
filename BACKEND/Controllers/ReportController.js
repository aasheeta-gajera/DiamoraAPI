import Diamond from "../Models/Diamond.model.js";
import moment from "moment";
import {User} from "../Models/user.model.js";
import PurchaseDiamond from "../Models/purchaseDiamond.model.js";
import Cart from "../Models/Cart.model.js";

export const getOverallAnalytics = async (req, res) => {

    try {
        const sales = await Diamond.find();
        const inventory = await PurchaseDiamond.find();
        const customers = await User.find();

        let totalRevenue = 0;
        let totalProfit = 0;
        let totalSalesCount = sales.length;
        let totalInventoryCount = inventory.length;
        let totalCustomers = customers.length;

        const shapeCountMap = {};
        const shapeProfitMap = {};

        sales.forEach(sale => {
            const shape = sale.shape || "Unknown";
            const revenue = sale.totlePrice || 0;
            const profit = sale.profitOrLossUSD || 0;

            totalRevenue += revenue;
            totalProfit += profit;

            shapeCountMap[shape] = (shapeCountMap[shape] || 0) + 1;
            shapeProfitMap[shape] = (shapeProfitMap[shape] || 0) + profit;
        });

        const topSellingShape = Object.entries(shapeCountMap).sort((a, b) => b[1] - a[1])[0];
        const mostProfitableShape = Object.entries(shapeProfitMap).sort((a, b) => b[1] - a[1])[0];
        const worstSellingShape = Object.entries(shapeCountMap).sort((a, b) => a[1] - b[1])[0];

        res.status(200).send({
            totalSalesCount,
            totalRevenue,
            totalProfit,
            averageOrderValue: totalSalesCount > 0 ? (totalRevenue / totalSalesCount).toFixed(2) : 0,
            totalInventoryCount,
            totalCustomers,
            topSellingShape: {
                shape: topSellingShape?.[0],
                count: topSellingShape?.[1]
            },
            mostProfitableShape: {
                shape: mostProfitableShape?.[0],
                profit: mostProfitableShape?.[1]
            },
            worstSellingShape: {
                shape: worstSellingShape?.[0],
                count: worstSellingShape?.[1]
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).send({ message: error.message });
    }
};

export const getTimeBasedSales = async (req, res) => {
    try {
        const sales = await Diamond.find();

        const dailySales = {};
        const weeklySales = {};
        const monthlySales = {};

        sales.forEach(sale => {
            const date = moment(sale.createdAt).format('YYYY-MM-DD');
            const week = moment(sale.createdAt).format('YYYY-[W]WW');
            const month = moment(sale.createdAt).format('YYYY-MM');

            dailySales[date] = (dailySales[date] || 0) + sale.purchasePrice;
            weeklySales[week] = (weeklySales[week] || 0) + sale.purchasePrice;
            monthlySales[month] = (monthlySales[month] || 0) + sale.purchasePrice;
        });

        res.status(200).send({
            dailySales,
            weeklySales,
            monthlySales
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getCustomerAnalytics = async (req, res) => {
    try {
        const customers = await User.find();
        const sales = await Diamond.find();

        const customerOrderMap = {};
        sales.forEach(sale => {
            const userId = sale.userId;
            customerOrderMap[userId] = (customerOrderMap[userId] || 0) + 1;
        });

        const totalCustomers = customers.length;
        const averageOrders = totalCustomers > 0 ? (sales.length / totalCustomers).toFixed(2) : 0;

        const highValueCustomers = Object.entries(customerOrderMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([userId, count]) => ({ userId, orderCount: count }));

        const repeatCustomers = Object.values(customerOrderMap).filter(count => count > 1).length;
        const oneTimeCustomers = totalCustomers - repeatCustomers;

        res.status(200).send({
            totalCustomers,
            averageOrdersPerCustomer: averageOrders,
            highValueCustomers,
            repeatCustomers,
            oneTimeCustomers
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getInventoryAnalytics = async (req, res) => {
    try {
        const inventory = await PurchaseDiamond.find();

        const inStock = inventory.filter(item => item.totalDiamonds > 0).length;
        const outOfStock = inventory.filter(item => item.totalDiamonds === 0).length;
        const lowStockItems = inventory.filter(item => item.totalDiamonds > 0 && item.totalDiamonds < 5);

        const fastSellingItems = inventory
            .slice(0, 5) // fallback (no soldCount available)
            .map(item => ({ name: item.itemCode, soldCount: 0 }));

        res.status(200).send({
            totalInventory: inventory.length,
            inStock,
            outOfStock,
            lowStockItems,
            fastSellingItems
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getProfitMarginAnalytics = async (req, res) => {
    try {
        const sales = await Diamond.find();

        const marginMap = {};
        sales.forEach(sale => {
            const shape = sale.shape || "Unknown";
            const revenue = sale.totlePrice || 0;
            const profit = sale.profitOrLossUSD || 0;

            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            if (!marginMap[shape]) marginMap[shape] = [];
            marginMap[shape].push(margin);
        });

        const averageMarginByShape = {};
        Object.entries(marginMap).forEach(([shape, margins]) => {
            const avg = margins.reduce((a, b) => a + b, 0) / margins.length;
            averageMarginByShape[shape] = avg.toFixed(2);
        });

        res.status(200).send({
            averageMarginByShape
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getAbandonedCartsAnalytics = async (req, res) => {
    try {
        const carts = await Cart.send({ status: "abandoned" });

        let totalAbandonedValue = 0;
        const productCountMap = {};

        carts.forEach(cart => {
            const cartValue = cart.price * cart.quantity;
            totalAbandonedValue += cartValue;
            productCountMap[cart.itemCode] = (productCountMap[cart.itemCode] || 0) + cart.quantity;
        });

        const topAbandonedProducts = Object.entries(productCountMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([itemCode, count]) => ({ itemCode, count }));

        res.status(200).send({
            abandonedCartCount: carts.length,
            totalAbandonedValue,
            topAbandonedProducts
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


export const getSearchAnalytics = async (req, res) => {
    try {
        const searches = await Diamond.find();

        const shapeSearchMap = {};         // counts of shapes searched
        const noResultSearches = [];       // list of queries with 0 results
        const filterUsageMap = {};         // counts of filters used

        searches.forEach(search => {
            // Count shapes
            if (search.shape) {
                shapeSearchMap[search.shape] = (shapeSearchMap[search.shape] || 0) + 1;
            }

            // Track no-result queries
            if (search.resultCount === 0) {
                noResultSearches.push(search.query);
            }

            // Count filters used
            if (Array.isArray(search.filters)) {
                search.filters.forEach(f => {
                    filterUsageMap[f] = (filterUsageMap[f] || 0) + 1;
                });
            }
        });

        // Convert shapeSearchMap to sorted array (top 5)
        const topSearchedShapes = Object.entries(shapeSearchMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([shape, count]) => ({ shape, count }));

        // Convert filterUsageMap to sorted array (top 5)
        const popularFilters = Object.entries(filterUsageMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([filter, count]) => ({ filter, count }));

        res.status(200).send({
            totalSearches: searches.length,
            topSearchedShapes,
            noResultSearches,
            popularFilters
        });

    } catch (error) {
        console.error("Search Analytics Error:", error);
        res.status(500).send({ message: error.message });
    }
};


// export const getPaymentAnalytics = async (req, res) => {
//     try {
//         const payments = await Payment.find();

//         const methodMap = {};
//         let failedCount = 0;
//         let refundCount = 0;
//         let refundValue = 0;

//         payments.forEach(p => {
//             if (p.status === "failed") {
//                 failedCount++;
//                 return;
//             }

//             if (p.status === "refunded") {
//                 refundCount++;
//                 refundValue += p.amount;
//                 return;
//             }

//             methodMap[p.method] = (methodMap[p.method] || 0) + p.amount;
//         });

//         res.status(200).send({
//             totalByMethod: methodMap,
//             failedPayments: failedCount,
//             refunds: {
//                 count: refundCount,
//                 value: refundValue
//             }
//         });

//     } catch (error) {
//         res.status(500).send({ message: error.message });
//     }
// };
