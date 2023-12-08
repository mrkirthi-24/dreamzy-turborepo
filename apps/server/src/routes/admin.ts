//tasks
//authentication signup login
//products create get edit

import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { Admin, Product } from "../db";
import { authenticateJWT, SECRET_KEY } from "../middleware";
import { adminSchema, productSchema } from "../types/types";

const router: Router = Router();

//SignUp Admin
router.post("/signup", async (req: Request, res: Response) => {
  const parsedData = adminSchema.safeParse(req.body);
  if (!parsedData.success)
    return res.status(404).json({ error: "Invalid Input provided." });

  const username = parsedData.data.username;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    const newAdmin = new Admin(req.body);
    newAdmin.save();
    const token = jwt.sign({ id: newAdmin._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin created successfully", token });
  } else return res.status(400).json({ message: "Admin already exists" });
});

//Login Admin
router.post("/login", async (req: Request, res: Response) => {
  const parsedData = adminSchema.safeParse(req.body);
  if (!parsedData.success)
    return res.status(404).json({ error: "Invalid Input provided." });

  const { username, password } = parsedData.data;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ id: admin._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin LoggedIn successfully", token });
  } else
    return res.status(403).json({ message: "Invalid username or password" });
});

//Create Product
router.post(
  "/createproduct",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const parsedData = productSchema.safeParse(req.body);
      if (!parsedData.success)
        return res.status(404).json({ error: "Invalid Input provided." });

      const { category, title, description, imageUrl, mrp, sell, quantity } =
        parsedData.data;
      const adminId = req.headers["authId"];
      const newProduct = {
        category,
        title,
        description,
        imageUrl,
        mrp,
        sell,
        quantity,
        adminId,
      };
      await Product.create(newProduct);

      //get all products
      const products = await Product.find({ adminId });

      res.status(200).json(products);
    } catch (error) {
      console.error("Error saving product:", error);
      res.status(500).json({ error: "Failed to create a new product" });
    }
  }
);

//Get Product
router.get("/products", authenticateJWT, (req: Request, res: Response) => {
  const adminId = req.headers["authId"];
  Product.find({ adminId })
    .then((products) => {
      res.status(200).json(products);
    })
    .catch(() => {
      res.status(500).json({ error: "Failed to retrieve products" });
    });
});

//Edit Product
router.put(
  "/product/:id",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const adminId = req.headers["authId"];
      const parsedData = productSchema.safeParse(req.body);
      if (!parsedData.success)
        return res.status(404).json({ error: "Invalid Input provided." });

      const newProduct = parsedData.data;

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, adminId },
        newProduct,
        {
          new: true,
        }
      );
      if (!updatedProduct) {
        return res
          .status(404)
          .json({ error: `Product not found with id: ${productId}` });
      }

      //get all products
      const products = await Product.find({ adminId });
      res.status(200).json(products);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: `Failed to update product` });
    }
  }
);

//Delete product
router.delete(
  "/product/:productId",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const adminId = req.headers["authId"];

      const deletedProduct = await Product.findOneAndDelete({
        _id: productId,
        adminId,
      });

      if (!deletedProduct) {
        return res
          .status(404)
          .json({ error: `Product not found with id: ${productId}` });
      }

      const products = await Product.find({ adminId }); // Fetch all products

      res
        .status(200)
        .json({ message: "Product deleted successfully", products });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;