import { Request, Response } from "express";
export const getProfile = (req: Request, res: Response) => {
  console.log(req.user);
  res.send(req.user);
};
