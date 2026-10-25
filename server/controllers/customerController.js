
import Customer from "../models/Customer.js";

// GET: Get all customers belonging to the logged-in user
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      owner: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: customers.length,
      customers
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customers"
    });
  }
};

// POST: Add a new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email and phone are required"
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company: company || "",
      status: status || "Lead",
      owner: req.user.id
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create customer"
    });
  }
};

// GET: Get one customer
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.status(200).json({ customer });
  } catch (error) {
    res.status(400).json({
      message: "Invalid customer ID or request"
    });
  }
};

// PUT: Update a customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      customer
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update customer"
    });
  }
};

// DELETE: Delete a customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete customer"
    });
  }
};
