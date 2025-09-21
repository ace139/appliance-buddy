import { Request, Response, NextFunction } from 'express';
import { ApplianceService } from '../services/applianceService';

export class ApplianceController {
  private applianceService = new ApplianceService();

  getAllAppliances = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, brand, warrantyStatus, page = 1, limit = 10 } = req.query;
      
      const filters = {
        search: search as string,
        brand: brand as string,
        warrantyStatus: warrantyStatus as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await this.applianceService.getAllAppliances(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getApplianceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const appliance = await this.applianceService.getApplianceById(id);
      
      if (!appliance) {
        return res.status(404).json({ error: 'Appliance not found' });
      }
      
      res.json(appliance);
    } catch (error) {
      next(error);
    }
  };

  createAppliance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Data is already validated by middleware
      const appliance = await this.applianceService.createAppliance(req.body);
      res.status(201).json(appliance);
    } catch (error) {
      next(error);
    }
  };

  updateAppliance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Data is already validated by middleware
      const appliance = await this.applianceService.updateAppliance(id, req.body);
      
      if (!appliance) {
        return res.status(404).json({ error: 'Appliance not found' });
      }
      
      res.json(appliance);
    } catch (error) {
      next(error);
    }
  };

  deleteAppliance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const success = await this.applianceService.deleteAppliance(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Appliance not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getWarrantyStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const warrantyInfo = await this.applianceService.getWarrantyStatus(id);
      
      if (!warrantyInfo) {
        return res.status(404).json({ error: 'Appliance not found' });
      }
      
      res.json(warrantyInfo);
    } catch (error) {
      next(error);
    }
  };
}