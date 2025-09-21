import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenanceService';
import { CreateMaintenanceTaskSchema, UpdateMaintenanceTaskSchema } from '../utils/validators';

export class MaintenanceController {
  private maintenanceService = new MaintenanceService();

  getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applianceId, status, dueSoon, page = 1, limit = 10 } = req.query;
      
      const filters = {
        applianceId: applianceId as string,
        status: status as string,
        dueSoon: dueSoon === 'true',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await this.maintenanceService.getAllTasks(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const task = await this.maintenanceService.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }
      
      res.json(task);
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = CreateMaintenanceTaskSchema.parse(req.body);
      const task = await this.maintenanceService.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = UpdateMaintenanceTaskSchema.parse(req.body);
      const task = await this.maintenanceService.updateTask(id, validatedData);
      
      if (!task) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }
      
      res.json(task);
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const success = await this.maintenanceService.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  completeTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const task = await this.maintenanceService.completeTask(id);
      
      if (!task) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }
      
      res.json(task);
    } catch (error) {
      next(error);
    }
  };

  getTasksByAppliance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applianceId } = req.params;
      const tasks = await this.maintenanceService.getTasksByAppliance(applianceId);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  };
}