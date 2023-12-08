import { z } from "zod";

// Admin Schema and Type
const adminSchema = z.object({
  fullname: z.string().max(50).optional(),
  username: z.string().email().min(5).max(25),
  password: z.string().min(6).max(150),
});

type AdminType = z.infer<typeof adminSchema>;

// User Schema and Type
const userSchema = z.object({
  fullname: z.string().optional(),
  phone: z.string().min(10).optional(),
  username: z.string().email().min(5).max(25),
  password: z.string().min(6).max(150),
  address: z.string().max(250).optional(),
  purchasedProducts: z.array(z.string()).optional(),
  wishlistProducts: z.array(z.string()).optional(),
});

type UserType = z.infer<typeof userSchema>;

// Product Schema and Type
const productSchema = z.object({
  category: z.string(),
  title: z.string(),
  description: z.string().optional(),
  mrp: z.number(),
  sell: z.number(),
  quantity: z.number(),
  imageUrl: z.string().optional(),
});

type ProductType = z.infer<typeof productSchema>;

export {
  adminSchema,
  userSchema,
  productSchema,
  AdminType,
  UserType,
  ProductType,
};
