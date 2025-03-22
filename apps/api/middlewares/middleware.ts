import type { Request, Response, NextFunction } from "express";

// interface CustomRequest extends Request {
//   userId?: string;
// }

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  //   console.log("Hello from middleware!");
  const authHeader = req.headers["authorization"];
  req.userId = "1";
  next();
};
