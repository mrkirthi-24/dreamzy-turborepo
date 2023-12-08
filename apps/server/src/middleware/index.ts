//Authentication middleware
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const SECRET_KEY = "secr3token";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, payload) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      if (payload) {
        if (!payload) {
          return res.sendStatus(403);
        }
        if (typeof payload === "string") {
          return res.sendStatus(403);
        }
        req.headers["authId"] = payload.id;
        next();
      }
    });
  } else return res.status(403).json({ message: "Unauthorized" });
};