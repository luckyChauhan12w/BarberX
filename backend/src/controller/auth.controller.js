import User from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const register = asyncHandler(async (req, res) => {
    const body = req.body;

    if (!body || typeof body !== 'object') {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    const {
        fullName,
        email,
        password,
        role = 'CUSTOMER'
    } = body;

    if (!fullName || typeof fullName !== 'object') {
        return res.status(400).json({ message: 'Full name is required' });
    }

    const { firstName, lastName } = fullName;

    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First name and last name are required' });
    }

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        fullName: {
            firstName: firstName.trim(),
            lastName: lastName.trim()
        },
        email: normalizedEmail,
        password: hashedPassword,
        role
    });

    res.status(201).json({
        id: user._id,
        email: user.email,
        role: user.role
    });
});



export {
    register
}