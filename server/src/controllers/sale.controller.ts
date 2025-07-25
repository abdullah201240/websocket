import {Request, Response, NextFunction } from "express";
import  Sale  from "../models/sale.model";
import { saleCreateValidator } from "../validators/sale.validator";
import { emitNewSale } from '../services/socket';
import { emitSaleUpdated, emitSaleDeleted } from '../services/socket';


export const addSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Convert saleDate to Date if it's a string
        if (typeof req.body.saleDate === 'string') {
            req.body.saleDate = new Date(req.body.saleDate);
        }
        const validatedData = saleCreateValidator.parse(req.body);
        const newSale = await Sale.create(validatedData);
        emitNewSale(newSale);
        res.status(201).json(newSale);
    }catch (error) {
        next(error);
    }


}  
export const getSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: sales } = await Sale.findAndCountAll({
            limit,
            offset,
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            sales,
        });
    } catch (error) {
        next(error);
    }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const saleId = req.params.id;
        const sale = await Sale.findByPk(saleId);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        // Convert saleDate to Date if it's a string
        if (typeof req.body.saleDate === 'string') {
            req.body.saleDate = new Date(req.body.saleDate);
        }
        // Optionally validate input here, or just update
        await sale.update(req.body);
        emitSaleUpdated(sale);
        res.status(200).json(sale);
    } catch (error) {
        next(error);
    }
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const saleId = req.params.id;
        const sale = await Sale.findByPk(saleId);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        await sale.destroy();
        emitSaleDeleted(saleId);
        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        next(error);
    }
};