import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const requestValidator = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
  };
};
