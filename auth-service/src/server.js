const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: "sunilcharanpahari@gmail.com" }
];

const SECRET_KEY = process.env.JWT_SECRET;

app.use(express.json());

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(401).send({ error: 'Invalid credentials' });
  }
});

app.listen(3003, () => {
  console.log('Auth Service running on port 3003');
});