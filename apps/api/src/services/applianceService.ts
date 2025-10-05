import { eq, ilike, and, desc, asc, sql, or } from 'drizzle-orm';
import { db, schema } from '../config/database';
import { CreateApplianceType, UpdateApplianceType } from '../utils/validators';
import { ApplianceFilters, PaginationResponse, WarrantyInfo } from '../types';
import { calculateWarrantyStatus } from '../utils/dateUtils';

export class ApplianceService {
  async getAllAppliances(filters: ApplianceFilters): Promise<PaginationResponse<any>> {
    const conditions = [];
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(schema.appliances.name, `%${filters.search}%`),
          ilike(schema.appliances.brand, `%${filters.search}%`),
          ilike(schema.appliances.model, `%${filters.search}%`)
        )
      );
    }
    
    if (filters.brand) {
      conditions.push(eq(schema.appliances.brand, filters.brand));
    }
    
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    const appliances = await db.select()
      .from(schema.appliances)
      .where(whereCondition)
      .orderBy(desc(schema.appliances.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);

    // Get total count for pagination
    const totalCountQuery = db.select({ count: sql<number>`count(*)` })
      .from(schema.appliances);
    
    const totalCount = whereCondition 
      ? await totalCountQuery.where(whereCondition)
      : await totalCountQuery;

    // Load relations for each appliance
    const appliancesWithRelations = await Promise.all(
      appliances.map(async (appliance) => {
        const [supportContacts, maintenanceTasks, linkedDocuments] = await Promise.all([
          db.select().from(schema.supportContacts).where(eq(schema.supportContacts.applianceId, appliance.id)),
          db.select().from(schema.maintenanceTasks).where(eq(schema.maintenanceTasks.applianceId, appliance.id)),
          db.select().from(schema.linkedDocuments).where(eq(schema.linkedDocuments.applianceId, appliance.id))
        ]);

        return {
          ...appliance,
          supportContacts,
          maintenanceTasks: maintenanceTasks.map(task => ({
            ...task,
            serviceProvider: task.serviceProviderName ? {
              name: task.serviceProviderName,
              phone: task.serviceProviderPhone,
              email: task.serviceProviderEmail,
              notes: task.serviceProviderNotes,
            } : undefined
          })),
          linkedDocuments
        };
      })
    );

    return {
      data: appliancesWithRelations,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / filters.limit)
      }
    };
  }

  async getApplianceById(id: string) {
    const appliance = await db.select().from(schema.appliances).where(eq(schema.appliances.id, id)).limit(1);
    
    if (appliance.length === 0) {
      return null;
    }

    const [supportContacts, maintenanceTasks, linkedDocuments] = await Promise.all([
      db.select().from(schema.supportContacts).where(eq(schema.supportContacts.applianceId, id)),
      db.select().from(schema.maintenanceTasks).where(eq(schema.maintenanceTasks.applianceId, id)),
      db.select().from(schema.linkedDocuments).where(eq(schema.linkedDocuments.applianceId, id))
    ]);

    return {
      ...appliance[0],
      supportContacts,
      maintenanceTasks: maintenanceTasks.map(task => ({
        ...task,
        serviceProvider: task.serviceProviderName ? {
          name: task.serviceProviderName,
          phone: task.serviceProviderPhone,
          email: task.serviceProviderEmail,
          notes: task.serviceProviderNotes,
        } : undefined
      })),
      linkedDocuments
    };
  }

  async createAppliance(data: CreateApplianceType) {
    const { supportContacts, maintenanceTasks, linkedDocuments, ...applianceData } = data;

    const result = db.transaction((tx) => {
      const appliance = tx.insert(schema.appliances).values(applianceData).returning().get();

      if (supportContacts?.length) {
        tx.insert(schema.supportContacts).values(
          supportContacts.map(contact => ({ ...contact, applianceId: appliance.id }))
        ).run();
      }

      if (maintenanceTasks?.length) {
        tx.insert(schema.maintenanceTasks).values(
          maintenanceTasks.map(task => ({
            ...task,
            applianceId: appliance.id,
            serviceProviderName: task.serviceProvider?.name,
            serviceProviderPhone: task.serviceProvider?.phone,
            serviceProviderEmail: task.serviceProvider?.email,
            serviceProviderNotes: task.serviceProvider?.notes,
          }))
        ).run();
      }

      if (linkedDocuments?.length) {
        tx.insert(schema.linkedDocuments).values(
          linkedDocuments.map(doc => ({ ...doc, applianceId: appliance.id }))
        ).run();
      }

      return appliance.id;
    });

    return this.getApplianceById(result);
  }

  async updateAppliance(id: string, data: UpdateApplianceType) {
    const { supportContacts, maintenanceTasks, linkedDocuments, ...applianceData } = data;

    const result = db.transaction((tx) => {
      const appliance = tx.update(schema.appliances)
        .set({ ...applianceData, updatedAt: new Date() })
        .where(eq(schema.appliances.id, id))
        .returning()
        .get();

      if (!appliance) {
        return null;
      }

      // Update related entities if provided
      if (supportContacts !== undefined) {
        tx.delete(schema.supportContacts).where(eq(schema.supportContacts.applianceId, id)).run();
        if (supportContacts.length > 0) {
          tx.insert(schema.supportContacts).values(
            supportContacts.map(contact => ({ ...contact, applianceId: id }))
          ).run();
        }
      }

      if (maintenanceTasks !== undefined) {
        tx.delete(schema.maintenanceTasks).where(eq(schema.maintenanceTasks.applianceId, id)).run();
        if (maintenanceTasks.length > 0) {
          tx.insert(schema.maintenanceTasks).values(
            maintenanceTasks.map(task => ({
              ...task,
              applianceId: id,
              serviceProviderName: task.serviceProvider?.name,
              serviceProviderPhone: task.serviceProvider?.phone,
              serviceProviderEmail: task.serviceProvider?.email,
              serviceProviderNotes: task.serviceProvider?.notes,
            }))
          ).run();
        }
      }

      if (linkedDocuments !== undefined) {
        tx.delete(schema.linkedDocuments).where(eq(schema.linkedDocuments.applianceId, id)).run();
        if (linkedDocuments.length > 0) {
          tx.insert(schema.linkedDocuments).values(
            linkedDocuments.map(doc => ({ ...doc, applianceId: id }))
          ).run();
        }
      }

      return appliance.id;
    });

    if (!result) {
      return null;
    }

    return this.getApplianceById(result);
  }

  async deleteAppliance(id: string): Promise<boolean> {
    const result = await db.delete(schema.appliances).where(eq(schema.appliances.id, id)).returning();
    return result.length > 0;
  }

  async getWarrantyStatus(id: string): Promise<WarrantyInfo | null> {
    const appliance = await db.select().from(schema.appliances).where(eq(schema.appliances.id, id)).limit(1);
    
    if (appliance.length === 0) {
      return null;
    }

    return calculateWarrantyStatus(appliance[0].purchaseDate, appliance[0].warrantyDurationMonths);
  }
}