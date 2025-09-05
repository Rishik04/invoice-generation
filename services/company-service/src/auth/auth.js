import * as jwt from "jsonwebtoken";
import { errorResponse } from "../response/response.js";

export const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split("Bearer ")[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return errorResponse(res, 401, "Unauthorized", {});
      }
      req.user = decoded;
      next();
    });
  } else {
    errorResponse(res, 401, "Unauthorized", {});
    res.redirect("/login");
  }
};
