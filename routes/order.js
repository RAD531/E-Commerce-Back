import express from 'express'
import { createOrder, getMyOrders } from '../controllers/order.js';
import { isAuthenticated } from "../middlewares/auth.js"

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
router.get("/my", isAuthenticated, getMyOrders);

export default router;