import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500
        },
        duration: {
            type: Number,
            required: true,
            min: 5,
            max: 480
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceCategory',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        image: {
            type: String
        }
    },
    { timestamps: true }
);

export const Service = mongoose.model('Service', ServiceSchema);
