import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_PUBLIC_KEY } from "../config";

// interface CustomRequest extends Request {
//   userId?: string;
// }

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorizedfff" });
    return;
  }

  const decoded = jwt.verify(token, JWT_PUBLIC_KEY);
  if (!decoded || !decoded.sub) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.userId = decoded.sub as string;
  next();
};
