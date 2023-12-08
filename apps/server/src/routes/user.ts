//tasks
//authentication signup login
//products buy get
//profile edit delete

import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { Product, User } from "../db";
import { authenticateJWT, SECRET_KEY } from "../middleware";
import { userSchema } from "../types/types";

const router: Router = Router();

//SignUp User
router.post("/signup", async (req: Request, res: Response) => {
  const parsedData = userSchema.safeParse(req.body);
  if (!parsedData.success)
    return res.status(404).json({ error: "Invalid Input provided." });

  const username = parsedData.data.username;
  const admin = await User.findOne({ username });
  if (!admin) {
    const newUser = new User(req.body);
    newUser.save();
    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  } else return res.status(400).json({ message: "User already exists" });
});

//Login User
router.post("/login", async (req: Request, res: Response) => {
  const parsedData = userSchema.safeParse(req.body);
  if (!parsedData.success)
    return res.status(404).json({ error: "Invalid Input provided." });

  const { username, password } = parsedData.data;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ id: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({
      message: "User LoggedIn successfully",
      token,
      firstname: user.fullname?.split(" ")[0],
    });
  } else
    return res.status(403).json({ message: "Invalid username or password" });
});

//Get Products
router.get("/products", (req: Request, res: Response) => {
  Product.find()
    .then((products) => {
      res.status(200).json(products);
    })
    .catch(() => {
      res.status(500).json({ error: "Failed to retrieve products" });
    });
});

//Get Product with productId
router.get("/product/:productId", (req: Request, res: Response) => {
  const prodId = req.params.productId;
  Product.find({ _id: prodId })
    .then((product) => {
      res.status(200).json(product);
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "Failed to retrieve product with id:" + prodId });
    });
});

// Wishlist Product
router.post(
  "/product/wishlist/:productId",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const userId = req.headers["authId"];
      const product = await Product.findById(productId);
      const user = await User.findById(userId);

      if (user != null && product != null) {
        user.wishlistProducts.push(product._id);
        await user.save();

        res
          .status(200)
          .json({ message: "Product added to wishlist successfully", user });
      } else {
        res.status(404).json({ message: "User or product not found." });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

//Purchase Products
router.post(
  "/product/purchase/:productId",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const userId = req.headers["authId"];
      const product = await Product.findById(productId);
      const user = await User.findById(userId);
      if (user != null && product != null) {
        user.purchasedProducts.push(product._id);
        await user.save();
        if (product.quantity) {
          if (product.quantity > 0) {
            product.quantity = product.quantity - 1;
            await product.save();
          }
        }
        res.status(200).json({ message: "Product successfully purchased." });
      } else {
        res.status(404).json({ message: "User or product not found." });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

//Edit Profile
router.patch(
  "/profile/:userId",
  authenticateJWT,
  (req: Request, res: Response) => {
    const userId = req.params.userId;
    const newUserProfile = req.body;
    User.findOneAndUpdate({ _id: userId }, newUserProfile, {
      new: true,
    })
      .then((updatedProfile) => {
        res.status(200).json(updatedProfile);
      })
      .catch(() => {
        res.status(500).json({ error: `Failed to update User profile` });
      });
  }
);

//Permanent Delete UserProfile
router.delete(
  "/profile/:userId",
  authenticateJWT,
  (req: Request, res: Response) => {
    const userId = req.params.userId;
    User.findOneAndDelete({ _id: userId })
      .then((deletedProfile) => {
        if (deletedProfile)
          res.status(200).json(`Profile deleted: ${deletedProfile.username}`);
        else res.status(403).json({ error: `Failed to delete User profile` });
      })
      .catch(() => {
        res.status(500).json({ error: `Error occured` });
      });
  }
);

export default router;
