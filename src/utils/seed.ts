import { db, collection, addDoc, setDoc, doc } from '../firebase';
import { subDays, addDays } from 'date-fns';

export async function seedInitialData() {
  // Check if data already exists
  // For simplicity, we'll just try to seed if the config doesn't exist
  try {
    const configDoc = await doc(db, 'config', 'global');
    // If we can't get it, we'll assume we need to seed
    
    // Seed Config
    await setDoc(doc(db, 'config', 'global'), {
      gymName: 'ARSA Fit Elite',
      logoUrl: 'https://picsum.photos/seed/gym/200/200',
      currency: 'USD',
      pricing: { Standard: 29, Pro: 59, AI: 99 }
    });

    // Seed Members
    const members = [
      {
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        phone: '5550123',
        tier: 'AI',
        status: 'ACTIVE',
        lastCheckIn: subDays(new Date(), 4).toISOString(), // AT_RISK
        subscriptionExpiry: addDays(new Date(), 5).toISOString(), // Expiring soon
        nutritionData: [
          { date: '2024-03-10', kCal: 2100, protein: 150, carbs: 200, fat: 70 },
          { date: '2024-03-11', kCal: 1900, protein: 140, carbs: 180, fat: 65 },
          { date: '2024-03-12', kCal: 2200, protein: 160, carbs: 210, fat: 75 },
        ]
      },
      {
        name: 'Marcus Thorne',
        email: 'marcus.t@example.com',
        phone: '5550456',
        tier: 'Pro',
        status: 'ACTIVE',
        lastCheckIn: new Date().toISOString(),
        subscriptionExpiry: addDays(new Date(), 30).toISOString(),
        nutritionData: []
      },
      {
        name: 'Elena Rodriguez',
        email: 'elena.r@example.com',
        phone: '5550789',
        tier: 'Standard',
        status: 'ACTIVE',
        lastCheckIn: subDays(new Date(), 1).toISOString(),
        subscriptionExpiry: addDays(new Date(), 3).toISOString(), // Expiring soon
        nutritionData: []
      }
    ];

    for (const member of members) {
      await addDoc(collection(db, 'members'), member);
    }

    // Seed Trainers
    const trainers = [
      { name: 'Alex Rivera', specialization: 'HIIT & Strength', membersAssigned: 12, rating: 4.9, shift: 'Morning', status: 'Active' },
      { name: 'Sarah Chen', specialization: 'Yoga & Pilates', membersAssigned: 18, rating: 4.7, shift: 'Evening', status: 'Active' },
      { name: 'Julian Voss', specialization: 'Boxing & MMA', membersAssigned: 8, rating: 5.0, shift: 'Morning', status: 'On Break' }
    ];

    for (const trainer of trainers) {
      await addDoc(collection(db, 'trainers'), trainer);
    }

    // Seed Inquiries
    const inquiries = [
      { name: 'Jordan Smith', contact: '5550999', program: 'Elite Coaching', status: 'Decision Pitch', inquiryDate: subDays(new Date(), 8).toISOString() },
      { name: 'Alex Kim', contact: '5550888', program: 'Personal Training', status: 'Open', inquiryDate: new Date().toISOString() }
    ];

    for (const inquiry of inquiries) {
      await addDoc(collection(db, 'inquiries'), inquiry);
    }

    // Seed Expenses
    const expenses = [
      { title: 'Monthly Rent', category: 'Rent', amount: 5000, date: subDays(new Date(), 15).toISOString() },
      { title: 'Electricity Bill', category: 'Electricity', amount: 450, date: subDays(new Date(), 10).toISOString() },
      { title: 'Staff Salaries', category: 'Staff', amount: 12000, date: subDays(new Date(), 5).toISOString() }
    ];

    for (const expense of expenses) {
      await addDoc(collection(db, 'expenses'), expense);
    }

    console.log('Initial data seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}
