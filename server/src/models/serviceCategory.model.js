import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);
