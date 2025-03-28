const express = require('express');
const httpProxy = require('http-proxy-middleware');
const app = express();
const cors  = require('cors');

const COMPANY_SERVICE = 'http://localhost:3001';
const INVOICE_SERVICE = 'http://localhost:3002';
const AUTH_SERVICE = 'http://localhost:3003';
const PDF_SERVICE = 'http://localhost:3004';

app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/auth', httpProxy.createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true
}));

// Company routes
app.use('/company', httpProxy.createProxyMiddleware({
  target: COMPANY_SERVICE,
  changeOrigin: true
}));

// Invoice routes
app.use('/invoice', httpProxy.createProxyMiddleware({
  target: INVOICE_SERVICE,
  changeOrigin: true
}));

//pdf routes
app.use('/pdf', httpProxy.createProxyMiddleware({
    target: PDF_SERVICE,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('PDF Proxy Error:', err);
      res.status(502).send('PDF Service Unavailable');
    }
  }));

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});