
import express from "express";
import protect from "../middleware/auth.js";

import {
  getCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/customerController.js";

const router = express.Router();

// Require authentication for every customer route
router.use(protect);

// Get all customers and create a customer
router.route("/")
  .get(getCustomers)
  .post(createCustomer);

// Get, update, or delete one customer
router.route("/:id")
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);

export default router;
