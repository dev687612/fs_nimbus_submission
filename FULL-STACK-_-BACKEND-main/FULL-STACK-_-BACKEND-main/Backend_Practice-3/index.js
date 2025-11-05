const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/accountDB';

app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: String,
  balance: Number
});

const User = mongoose.model('User', userSchema);

app.post('/create-users', async (req, res) => {
  try {
    await User.deleteMany({});

    const usersData = [
      { name: 'Alice', balance: 1000 },
      { name: 'Bob', balance: 500 }
    ];
    
    const users = await User.create(usersData);
    res.status(201).json({
      message: 'Users created.',
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating users', error: error.message });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during transfer', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});