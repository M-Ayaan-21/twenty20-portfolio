const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---------------- MONGOOSE SETUP ----------------
let isConnected = false;

async function connectToDatabase() {
    if (isConnected) return;

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
}

// ---------------- USER SCHEMA ----------------
const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ---------------- HANDLER ----------------
module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { name, email, password } = req.body || {};

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
