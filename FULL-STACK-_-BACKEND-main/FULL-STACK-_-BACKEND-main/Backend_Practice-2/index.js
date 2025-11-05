const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-very-secure-secret-key';

app.use(express.json());

const hardcodedUser = {
  username: 'user1',
  password: 'password123'
};

let accountBalance = 1000;

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === hardcodedUser.username && password === hardcodedUser.password) {
    const token = jwt.sign({ username: hardcodedUser.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

app.get('/balance', authenticateToken, (req, res) => {
  res.json({ balance: accountBalance });
});

app.post('/deposit', authenticateToken, (req, res) => {
  const { amount } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  accountBalance += amount;
  res.json({ message: `Deposited $${amount}.`, newBalance: accountBalance });
});

app.post('/withdraw', authenticateToken, (req, res) => {
  const { amount } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  if (amount > accountBalance) {
    return res.status(400).json({ message: 'Insufficient funds' });
  }

  accountBalance -= amount;
  res.json({ message: `Withdrew $${amount}.`, newBalance: accountBalance });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});