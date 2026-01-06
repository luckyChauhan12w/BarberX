import mongoose from "mongoose";
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            firstName: {
                type: String,
                required: true,
                trim: true,
                minlength: 2,
                maxlength: 50
            },
            lastName: {
                type: String,
                required: true,
                trim: true,
                minlength: 2,
                maxlength: 50
            }
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 8,
            select: false
        },
        role: {
            type: String,
            enum: ['CUSTOMER', 'ADMIN', 'BARBER'],
            default: 'CUSTOMER',
            index: true
        },
        refreshToken: {
            type: String,
            select: false
        },
    },
    { timestamps: true }
)

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;