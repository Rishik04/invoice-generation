const express = require("express");
const httpProxy = require("http-proxy-middleware");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); 

app.use(cors());
app.use(express.json());

// Authentication routes
app.use(
  "/auth",
  httpProxy.createProxyMiddleware({
    target: "http://auth-service:3003",
    changeOrigin: true,
  })
);

// Company routes
app.use(
  "/company",
  httpProxy.createProxyMiddleware({
    target: "http://company-service:3001",
    changeOrigin: true,
  })
);

// Invoice routes
app.use(
  "/invoice",
  httpProxy.createProxyMiddleware({
    target: "http://invoice-service:3004",
    changeOrigin: true,
  })
);

//pdf routes
// app.use(
//   "/pdf",
//   httpProxy.createProxyMiddleware({
//     target: PDF_SERVICE,
//     changeOrigin: true,
//     onError: (err, req, res) => {
//       console.error("PDF Proxy Error:", err);
//       res.status(502).send("PDF Service Unavailable");
//     },
//   })
// );

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});
