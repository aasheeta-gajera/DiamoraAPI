import express from "express";
import { getTimeBasedSales,getCustomerAnalytics,getInventoryAnalytics ,getOverallAnalytics,getProfitMarginAnalytics,getAbandonedCartsAnalytics,getSearchAnalytics} from "../Controllers/ReportController.js";

const ReportRouter = express.Router();

ReportRouter.get('/getOverallAnalytics', getOverallAnalytics);

ReportRouter.get('/getTimeBasedSales', getTimeBasedSales);

ReportRouter.get('/getCustomerAnalytics', getCustomerAnalytics);

ReportRouter.get('/getInventoryAnalytics', getInventoryAnalytics);

ReportRouter.get('/getProfitMarginAnalytics', getProfitMarginAnalytics);

ReportRouter.get('/getAbandonedCartsAnalytics', getAbandonedCartsAnalytics);

ReportRouter.get('/getSearchAnalytics', getSearchAnalytics);

// ReportRouter.get('/getPaymentAnalytics', getPaymentAnalytics);

// ReportRouter.get('/getSalesReport', getSalesReport);

export default ReportRouter;