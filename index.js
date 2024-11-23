const express = require('express');
const sequelize = require('./db');
const User = require('./models/User');
const { body, validationResult } = require('express-validator');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;

// Middleware for parsing JSON
app.use(express.json());

// Sync Sequelize models
sequelize.sync()
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((err) => {
        console.error('Error creating database:', err);
    });

// Routes
app.get('/', (req, res) => {
    res.send('Home page');
})

// Fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ where: { status: true } }); // Fetch all users
        res.json({ message: 'All Users', users });
    } catch (err) {
        res.status(500).send('Error fetching users');
    }
});

// Create a new user
app.post('/users', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('mobile_no').notEmpty().withMessage('Mobile number is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile_no, status } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            return res.status(400).json({ message: 'user is already exist with same email.' });
        }

        const userStatus = status !== undefined ? status : true;

        const newUser = await User.create({ name, email, mobile_no, status: userStatus }); // Insert a new user
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});

// Update user by ID
app.put('/users/:id', [
    body('name').optional().notEmpty().withMessage('Name cannot be empty')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long')
        .isLength({ max: 50 }).withMessage('Name must be no longer than 50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('mobile_no').optional().notEmpty().withMessage('Mobile number cannot be empty')
        .matches(/^[0-9]{10}$/).withMessage('Mobile number must be a valid 10-digit number'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params; // Get user ID from the URL
    const { name, email, mobile_no, status } = req.body; // Get updated data from request body

    try {
        // Find user by ID
        const user = await User.findByPk(id); // Find user by primary key (ID)

        // If user not found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.mobile_no = mobile_no || user.mobile_no;
        user.status = status !== undefined ? status : user.status;

        // Save updated user
        await user.save();

        res.status(200).json(user); // Respond with the updated user
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});


// Delete user by ID
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get user ID from URL

        // Find user by ID
        const user = await User.findByPk(id);

        // If user not found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user
        await user.destroy();

        res.status(200).json({ message: 'User deleted successfully' }); // Respond with success message
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

// Delete all users
app.delete('/users', async (req, res) => {
    try {
        // Delete all users
        const deletedCount = await User.destroy({ where: {} }); // {} will match all users

        if (deletedCount === 0) {
            return res.status(404).json({ message: 'No users found to delete' });
        }

        res.status(200).json({ message: `${deletedCount} users deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting users', error: err.message });
    }
});

// Run Port
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});