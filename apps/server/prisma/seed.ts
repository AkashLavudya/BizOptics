import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@bizoptics.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@bizoptics.com',
      password: adminPassword,
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo analyst user
  const analystPassword = await bcrypt.hash('Analyst@123456', 12);
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@bizoptics.com' },
    update: {},
    create: {
      email: 'analyst@bizoptics.com',
      password: analystPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'ANALYST',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Analyst user created:', analyst.email);

  // Create demo user
  const userPassword = await bcrypt.hash('User@123456', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@bizoptics.com' },
    update: {},
    create: {
      email: 'user@bizoptics.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'USER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create sample businesses for demo
  const sampleBusinesses = [
    {
      name: "Mario's Italian Restaurant",
      category: 'RESTAURANT' as const,
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'US',
      postalCode: '10001',
      lat: 40.7128,
      lng: -74.0060,
      phone: '+1-212-555-0101',
      website: null,
      rating: 4.2,
      reviewCount: 287,
    },
    {
      name: 'Sunshine Dental Clinic',
      category: 'HEALTHCARE' as const,
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      country: 'US',
      postalCode: '90001',
      lat: 34.0522,
      lng: -118.2437,
      phone: '+1-310-555-0202',
      website: 'http://sunshinedental.com',
      rating: 4.5,
      reviewCount: 156,
    },
    {
      name: 'Elite Hair Studio',
      category: 'BEAUTY_SALON' as const,
      address: '789 Fashion Blvd',
      city: 'Chicago',
      state: 'IL',
      country: 'US',
      postalCode: '60601',
      lat: 41.8781,
      lng: -87.6298,
      phone: '+1-312-555-0303',
      website: null,
      rating: 4.7,
      reviewCount: 421,
    },
    {
      name: 'ProFit Gym',
      category: 'FITNESS' as const,
      address: '321 Fitness Way',
      city: 'Houston',
      state: 'TX',
      country: 'US',
      postalCode: '77001',
      lat: 29.7604,
      lng: -95.3698,
      phone: '+1-713-555-0404',
      website: 'http://profitgym.com',
      rating: 4.1,
      reviewCount: 98,
    },
    {
      name: "Johnson's Hardware Store",
      category: 'RETAIL' as const,
      address: '654 Commerce Street',
      city: 'Phoenix',
      state: 'AZ',
      country: 'US',
      postalCode: '85001',
      lat: 33.4484,
      lng: -112.0740,
      phone: '+1-602-555-0505',
      website: null,
      rating: 3.9,
      reviewCount: 64,
    },
    {
      name: 'Grand Plaza Hotel',
      category: 'HOSPITALITY' as const,
      address: '100 Grand Avenue',
      city: 'Miami',
      state: 'FL',
      country: 'US',
      postalCode: '33101',
      lat: 25.7617,
      lng: -80.1918,
      phone: '+1-305-555-0606',
      website: 'http://grandplazahotel.com',
      rating: 4.3,
      reviewCount: 892,
    },
    {
      name: 'Smith & Associates Law',
      category: 'LEGAL' as const,
      address: '200 Legal Drive',
      city: 'Seattle',
      state: 'WA',
      country: 'US',
      postalCode: '98101',
      lat: 47.6062,
      lng: -122.3321,
      phone: '+1-206-555-0707',
      website: 'http://smithlaw.com',
      rating: 4.6,
      reviewCount: 43,
    },
    {
      name: 'Quick Auto Repair',
      category: 'AUTOMOTIVE' as const,
      address: '555 Garage Road',
      city: 'Denver',
      state: 'CO',
      country: 'US',
      postalCode: '80201',
      lat: 39.7392,
      lng: -104.9903,
      phone: '+1-303-555-0808',
      website: null,
      rating: 4.4,
      reviewCount: 178,
    },
  ];

  for (const businessData of sampleBusinesses) {
    const business = await prisma.business.upsert({
      where: { googlePlaceId: `demo_${businessData.name.toLowerCase().replace(/\s+/g, '_')}` },
      update: {},
      create: {
        ...businessData,
        googlePlaceId: `demo_${businessData.name.toLowerCase().replace(/\s+/g, '_')}`,
        isVerified: true,
      },
    });

    // Create analysis for each business
    const websiteScore = businessData.website ? 45 : 10;
    const automationScore = Math.floor(Math.random() * 40) + 40;
    const aiScore = Math.floor(Math.random() * 40) + 40;
    const finalScore = Math.round(websiteScore * 0.35 + automationScore * 0.35 + aiScore * 0.30);
    
    let priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (finalScore >= 90) priorityLevel = 'CRITICAL';
    else if (finalScore >= 75) priorityLevel = 'HIGH';
    else if (finalScore >= 50) priorityLevel = 'MEDIUM';

    const analysis = await prisma.analysis.create({
      data: {
        businessId: business.id,
        status: 'COMPLETED',
        hasWebsite: !!businessData.website,
        websiteUrl: businessData.website,
        hasHttps: false,
        hasContactPage: !!businessData.website,
        hasBookingPage: false,
        hasMobileOptimization: false,
        hasAnalytics: false,
        hasSocialProof: (businessData.reviewCount || 0) > 100,
        pageLoadScore: businessData.website ? 60 : 0,
        contentQualityScore: businessData.website ? 55 : 0,
        websiteScore,
        needsAppointmentBooking: ['HEALTHCARE', 'BEAUTY_SALON', 'LEGAL', 'FITNESS'].includes(businessData.category),
        needsLeadManagement: true,
        needsInventoryManagement: businessData.category === 'RETAIL',
        needsCustomerFollowUp: true,
        needsInvoicing: true,
        needsReporting: true,
        manualWorkflowCount: 5,
        automationScore,
        needsCustomerSupport: true,
        needsFaqAutomation: true,
        needsLeadQualification: true,
        needsAppointmentBot: ['HEALTHCARE', 'BEAUTY_SALON', 'LEGAL'].includes(businessData.category),
        needsReviewManagement: (businessData.reviewCount || 0) > 50,
        customerInteractionVolume: (businessData.reviewCount || 0) > 200 ? 'HIGH' : 'MEDIUM',
        aiScore,
        finalScore,
        priorityLevel,
        opportunityTypes: !businessData.website 
          ? ['WEBSITE_DEVELOPMENT', 'WORKFLOW_AUTOMATION', 'AI_AGENT'] 
          : ['WORKFLOW_AUTOMATION', 'AI_AGENT'],
        analyzedAt: new Date(),
      },
    });

    // Create recommendation
    await prisma.recommendation.create({
      data: {
        businessId: business.id,
        analysisId: analysis.id,
        primaryOpportunity: !businessData.website ? 'WEBSITE_DEVELOPMENT' : 'WORKFLOW_AUTOMATION',
        recommendations: [
          {
            opportunityType: !businessData.website ? 'WEBSITE_DEVELOPMENT' : 'WORKFLOW_AUTOMATION',
            title: !businessData.website ? 'Build Professional Website' : 'Automate Business Workflows',
            description: !businessData.website 
              ? 'This business has no online presence and is losing customers to competitors.'
              : 'Multiple manual workflows identified that can be automated to save time and money.',
            estimatedValue: '$5,000 - $15,000',
            priority: priorityLevel,
            reasons: ['No online presence', 'Competitors have websites', 'Missing booking functionality'],
            actionItems: ['Design website mockup', 'Present proposal', 'Schedule demo'],
          },
        ],
        totalEstimatedValue: '$5,000 - $15,000',
      },
    });

    console.log(`✅ Business created: ${business.name}`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('  Admin:   admin@bizoptics.com / Admin@123456');
  console.log('  Analyst: analyst@bizoptics.com / Analyst@123456');
  console.log('  User:    user@bizoptics.com / User@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
