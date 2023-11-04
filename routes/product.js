import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { addCategory, addProductImage, createProduct, deleteCategory, deleteProduct, deleteProductImage, getAdminProducts, getAllCategories, getAllProducts, getProductDetails, updateProduct } from "../controllers/products.js";

const router = express.Router();

router.get("/all", getAllProducts)
router.route("/product/:id").get(getProductDetails).put(isAuthenticated, isAdmin, updateProduct).delete(isAuthenticated, isAdmin, deleteProduct);
router.post("/new", isAuthenticated, isAdmin, singleUpload, createProduct);
router.route("/images/:id").post(isAuthenticated, isAdmin, singleUpload, addProductImage).delete(isAuthenticated, isAdmin, deleteProductImage);
router.post("/category", isAuthenticated, isAdmin, addCategory);
router.get("/categories", getAllCategories);
router.delete("/category/:id", isAuthenticated, isAdmin, deleteCategory);
router.get("/admin", isAuthenticated, isAdmin, getAdminProducts);

export default router;