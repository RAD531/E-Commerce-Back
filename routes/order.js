import express from 'express'
import { createOrder, getAdminOrders, getMyOrders, getOrderDetails, processOrder, processPayment } from '../controllers/order.js';
import { isAuthenticated, isAdmin } from "../middlewares/auth.js"

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
router.get("/my", isAuthenticated, getMyOrders);
router.get("/admin", isAuthenticated, isAdmin, getAdminOrders);
router.route("/order/:id").get(isAuthenticated, getOrderDetails).put(isAuthenticated, isAdmin, processOrder);
router.post("/payment", isAuthenticated, processPayment);

export default router;