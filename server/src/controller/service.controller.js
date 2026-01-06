import { Service } from '../models/service.model.js';
import { ServiceCategory } from '../models/serviceCategory.model.js';

export const createService = async (req, res, next) => {
    try {
        const { name, description, duration, price, category, isActive, image } = req.body;


        const categoryExists = await ServiceCategory.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Service Category not found' });
        }

        const newService = await Service.create({
            name,
            description,
            duration,
            price,
            category,
            isActive,
            image
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: newService
        });
    } catch (error) {
        next(error);
    }
};

export const getAllServices = async (req, res, next) => {
    try {
        const services = await Service.find({ isActive: true })
            .populate('category', 'name');

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        next(error);
    }
};
