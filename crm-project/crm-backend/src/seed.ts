import { Sequelize } from 'sequelize-typescript';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { Lead } from './models/lead.model';
import { Interaction, InteractionType } from './models/interaction.model';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface LeadRow {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budget?: string;
  location?: string;
  company?: string;
  source?: string;
  status?: string;
}

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db',
  models: [Lead, Interaction],
  logging: false,
});

// Helper function to get random interaction type
function getRandomInteractionType(): InteractionType {
  const types = [
    InteractionType.CALL,
    InteractionType.EMAIL,
    InteractionType.MEETING,
  ];
  return types[Math.floor(Math.random() * types.length)];
}

// Helper function to get random date within the last 30 days
function getRandomDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Sample interaction notes templates
const interactionNotesTemplates = [
  'Initial contact call. Lead expressed interest in our services.',
  'Follow-up email sent with product information.',
  'Meeting scheduled to discuss requirements in detail.',
  'Called to check in on their decision process.',
  'Sent pricing proposal via email.',
  'Demo meeting completed. Lead asked several questions.',
  'Follow-up call to address concerns.',
  'Email sent with additional case studies.',
  'Meeting to discuss implementation timeline.',
  'Called to confirm next steps.',
];

// Helper function to generate random interactions for a lead
async function generateInteractions(leadId: number): Promise<void> {
  const numInteractions = Math.floor(Math.random() * 4) + 2; // 2-5 interactions

  for (let i = 0; i < numInteractions; i++) {
    const type = getRandomInteractionType();
    const date = getRandomDate();
    const notes =
      interactionNotesTemplates[
        Math.floor(Math.random() * interactionNotesTemplates.length)
      ];

    await Interaction.create({
      type,
      date,
      notes,
      leadId,
    } as any);
  }
}

// Main seed function
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: true }); // WARNING: This drops existing tables
    console.log('✓ Database tables synchronized\n');

    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'seed-leads.csv');
    const leads: LeadRow[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row: LeadRow) => {
          leads.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    console.log(`📄 Read ${leads.length} leads from CSV file\n`);

    // Import leads and create interactions
    let leadCount = 0;
    let interactionCount = 0;

    for (const leadData of leads) {
      // Create lead
      const lead = await Lead.create({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone || undefined,
        budget: leadData.budget ? parseFloat(leadData.budget) : undefined,
        location: leadData.location || undefined,
        company: leadData.company || undefined,
        source: leadData.source || undefined,
        status: leadData.status || 'new',
      } as any);

      leadCount++;
      console.log(
        `✓ Created lead: ${lead.firstName} ${lead.lastName} (${lead.email})`,
      );

      // Generate random interactions for this lead
      const beforeCount = await Interaction.count();
      await generateInteractions(lead.id);
      const afterCount = await Interaction.count();
      const created = afterCount - beforeCount;
      interactionCount += created;

      console.log(`  └─ Generated ${created} interactions\n`);
    }

    console.log('═══════════════════════════════════════════════');
    console.log(`✓ Seed completed successfully!`);
    console.log(`  - ${leadCount} leads created`);
    console.log(`  - ${interactionCount} interactions created`);
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seed();
