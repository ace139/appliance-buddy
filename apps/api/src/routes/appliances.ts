import { Router } from 'express';
import { ApplianceController } from '../controllers/applianceController';
import { validateAppliance, validateApplianceUpdate } from '../middleware/validation';

const router: Router = Router();
const applianceController = new ApplianceController();

// GET /api/appliances - Get all appliances with optional filtering
router.get('/', applianceController.getAllAppliances);

// GET /api/appliances/:id - Get appliance by ID with relations
router.get('/:id', applianceController.getApplianceById);

// POST /api/appliances - Create new appliance
router.post('/', validateAppliance, applianceController.createAppliance);

// PUT /api/appliances/:id - Update appliance
router.put('/:id', validateApplianceUpdate, applianceController.updateAppliance);

// DELETE /api/appliances/:id - Delete appliance
router.delete('/:id', applianceController.deleteAppliance);

// GET /api/appliances/:id/warranty-status - Get warranty status
router.get('/:id/warranty-status', applianceController.getWarrantyStatus);

export default router;