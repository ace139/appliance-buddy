import { db, schema } from '../config/database';

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // Clear existing data
    await db.delete(schema.linkedDocuments);
    await db.delete(schema.maintenanceTasks);
    await db.delete(schema.supportContacts);
    await db.delete(schema.appliances);

    // Insert sample appliances
    const [appliance1] = await db.insert(schema.appliances).values({
      name: 'Whirlpool Dryer',
      brand: 'Whirlpool',
      model: 'WED5620HW',
      purchaseDate: new Date('2022-10-15'),
      warrantyDurationMonths: 24,
      serialNumber: 'WHIR-DR-001',
      purchaseLocation: 'Home Depot',
      notes: 'Stackable dryer with steam refresh cycle',
    }).returning();

    const [appliance2] = await db.insert(schema.appliances).values({
      name: 'Samsung TV',
      brand: 'Samsung',
      model: 'QN55Q80C',
      purchaseDate: new Date('2024-07-01'),
      warrantyDurationMonths: 36,
      serialNumber: 'SAM-TV-003',
      purchaseLocation: 'Best Buy',
      notes: 'Quantum HDR 24x with Direct Full Array backlighting',
    }).returning();

    // Insert support contacts
    await db.insert(schema.supportContacts).values([
      {
        applianceId: appliance1.id,
        name: 'Whirlpool Customer Service',
        company: 'Whirlpool Corporation',
        phone: '1-866-698-2538',
        email: 'customerservice@whirlpool.com',
        website: 'https://www.whirlpool.com/services/contact-us.html'
      },
      {
        applianceId: appliance2.id,
        name: 'Samsung Support',
        company: 'Samsung Electronics',
        phone: '1-800-SAMSUNG',
        email: 'support@samsung.com',
        website: 'https://www.samsung.com/us/support/'
      }
    ]);

    // Insert maintenance tasks
    await db.insert(schema.maintenanceTasks).values([
      {
        applianceId: appliance1.id,
        taskName: 'Clean lint trap and exhaust vent',
        scheduledDate: new Date('2024-12-01'),
        frequency: 'Monthly',
        status: 'Upcoming',
        notes: 'Check for blockages'
      },
      {
        applianceId: appliance2.id,
        taskName: 'Software update check',
        scheduledDate: new Date('2024-11-15'),
        frequency: 'Monthly',
        status: 'Upcoming',
        notes: 'Check for firmware updates'
      }
    ]);

    // Insert linked documents
    await db.insert(schema.linkedDocuments).values([
      {
        applianceId: appliance1.id,
        title: 'User Manual',
        url: 'https://www.whirlpool.com/content/dam/global/documents/201706/user-instructions-W10751102-A.pdf'
      },
      {
        applianceId: appliance2.id,
        title: 'TV Receipt',
        url: 'https://example.com/receipts/samsung-tv'
      }
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase;