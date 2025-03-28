const jwt = require("jsonwebtoken");
const { errorResponse } = require("../response/response");

const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split("Bearer ")[1];
  console.log(token);
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

module.exports = auth;
