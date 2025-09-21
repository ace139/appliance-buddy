import { eq, and, desc, sql, lte, gte } from 'drizzle-orm';
import { db, schema } from '../config/database';
import { CreateMaintenanceTaskType, UpdateMaintenanceTaskType } from '../utils/validators';
import { MaintenanceFilters, PaginationResponse } from '../types';
import { getMaintenanceStatus } from '../utils/dateUtils';
import { addDays } from 'date-fns';

export class MaintenanceService {
  async getAllTasks(filters: MaintenanceFilters): Promise<PaginationResponse<any>> {
    const conditions = [];
    
    if (filters.applianceId) {
      conditions.push(eq(schema.maintenanceTasks.applianceId, filters.applianceId));
    }
    
    if (filters.status) {
      conditions.push(eq(schema.maintenanceTasks.status, filters.status));
    }

    if (filters.dueSoon) {
      const sevenDaysFromNow = addDays(new Date(), 7);
      conditions.push(
        and(
          lte(schema.maintenanceTasks.scheduledDate, sevenDaysFromNow),
          gte(schema.maintenanceTasks.scheduledDate, new Date())
        )
      );
    }
    
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    const tasks = await db.select()
      .from(schema.maintenanceTasks)
      .where(whereCondition)
      .orderBy(desc(schema.maintenanceTasks.scheduledDate))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);

    // Get total count for pagination
    const totalCountQuery = db.select({ count: sql<number>`count(*)` })
      .from(schema.maintenanceTasks);
    
    const totalCount = whereCondition 
      ? await totalCountQuery.where(whereCondition)
      : await totalCountQuery;

    // Transform tasks to match frontend format
    const transformedTasks = tasks.map(task => ({
      ...task,
      serviceProvider: task.serviceProviderName ? {
        name: task.serviceProviderName,
        phone: task.serviceProviderPhone,
        email: task.serviceProviderEmail,
        notes: task.serviceProviderNotes,
      } : undefined
    }));

    return {
      data: transformedTasks,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / filters.limit)
      }
    };
  }

  async getTaskById(id: string) {
    const task = await db.select().from(schema.maintenanceTasks).where(eq(schema.maintenanceTasks.id, id)).limit(1);
    
    if (task.length === 0) {
      return null;
    }

    return {
      ...task[0],
      serviceProvider: task[0].serviceProviderName ? {
        name: task[0].serviceProviderName,
        phone: task[0].serviceProviderPhone,
        email: task[0].serviceProviderEmail,
        notes: task[0].serviceProviderNotes,
      } : undefined
    };
  }

  async createTask(data: CreateMaintenanceTaskType) {
    const taskData = {
      ...data,
      serviceProviderName: data.serviceProvider?.name,
      serviceProviderPhone: data.serviceProvider?.phone,
      serviceProviderEmail: data.serviceProvider?.email,
      serviceProviderNotes: data.serviceProvider?.notes,
    };

    const [task] = await db.insert(schema.maintenanceTasks).values(taskData).returning();
    return this.getTaskById(task.id);
  }

  async updateTask(id: string, data: UpdateMaintenanceTaskType) {
    const updateData = {
      ...data,
      serviceProviderName: data.serviceProvider?.name,
      serviceProviderPhone: data.serviceProvider?.phone,
      serviceProviderEmail: data.serviceProvider?.email,
      serviceProviderNotes: data.serviceProvider?.notes,
      updatedAt: new Date(),
    };

    const [task] = await db.update(schema.maintenanceTasks)
      .set(updateData)
      .where(eq(schema.maintenanceTasks.id, id))
      .returning();

    if (!task) {
      return null;
    }

    return this.getTaskById(id);
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(schema.maintenanceTasks).where(eq(schema.maintenanceTasks.id, id)).returning();
    return result.length > 0;
  }

  async completeTask(id: string) {
    const [task] = await db.update(schema.maintenanceTasks)
      .set({ 
        status: 'Completed',
        completedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.maintenanceTasks.id, id))
      .returning();

    if (!task) {
      return null;
    }

    return this.getTaskById(id);
  }

  async getTasksByAppliance(applianceId: string) {
    const tasks = await db.select()
      .from(schema.maintenanceTasks)
      .where(eq(schema.maintenanceTasks.applianceId, applianceId))
      .orderBy(desc(schema.maintenanceTasks.scheduledDate));

    return tasks.map(task => ({
      ...task,
      serviceProvider: task.serviceProviderName ? {
        name: task.serviceProviderName,
        phone: task.serviceProviderPhone,
        email: task.serviceProviderEmail,
        notes: task.serviceProviderNotes,
      } : undefined
    }));
  }
}