import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenanceController';
import { validateMaintenanceTask, validateMaintenanceTaskUpdate } from '../middleware/validation';

const router: Router = Router();
const maintenanceController = new MaintenanceController();

// GET /api/maintenance - Get all maintenance tasks with optional filtering
router.get('/', maintenanceController.getAllTasks);

// GET /api/maintenance/:id - Get specific maintenance task
router.get('/:id', maintenanceController.getTaskById);

// POST /api/maintenance - Create new maintenance task
router.post('/', validateMaintenanceTask, maintenanceController.createTask);

// PUT /api/maintenance/:id - Update maintenance task
router.put('/:id', validateMaintenanceTaskUpdate, maintenanceController.updateTask);

// DELETE /api/maintenance/:id - Delete maintenance task
router.delete('/:id', maintenanceController.deleteTask);

// PATCH /api/maintenance/:id/complete - Mark task as completed
router.patch('/:id/complete', maintenanceController.completeTask);

// GET /api/maintenance/appliances/:applianceId - Get tasks for specific appliance
router.get('/appliances/:applianceId', maintenanceController.getTasksByAppliance);

export default router;