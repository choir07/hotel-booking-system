// prisma/seed.ts

import { PrismaClient, UserRole, RoomType, BookingStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  console.log('📋 Clearing existing data...');

  // Clear existing data in correct order (due to foreign key constraints)
  await prisma.booking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Existing data cleared');

  // ==================== USERS ====================
  console.log('\n👤 Creating users...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hotel.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Test users
  const userPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'test@example.com',
        password: userPassword,
        name: 'Test User',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        password: userPassword,
        name: 'John Doe',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@email.com',
        password: userPassword,
        name: 'Jane Smith',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'robert.johnson@email.com',
        password: userPassword,
        name: 'Robert Johnson',
        role: UserRole.USER,
      },
    }),
  ]);
  console.log(`✅ ${users.length} test users created`);

  // ==================== HOTELS ====================
  console.log('\n🏨 Creating hotels...');

  const hotels = await Promise.all([
    prisma.hotel.create({
      data: {
        name: 'Grand Plaza Hotel',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        description: 'Luxury hotel in the heart of Manhattan with stunning city views. Features world-class amenities and exceptional service.',
        rating: 4.8,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Bar', 'Room Service', 'Parking'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'Ocean View Resort',
        address: '456 Beach Road',
        city: 'Miami',
        country: 'USA',
        description: 'Beautiful beachfront resort with private beach access. Perfect for a relaxing getaway with family or friends.',
        rating: 4.6,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Bar', 'Water Sports', 'Kids Club'],
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'Mountain View Lodge',
        address: '789 Pine Street',
        city: 'Denver',
        country: 'USA',
        description: 'Cozy mountain lodge with breathtaking views of the Rockies. Ideal for outdoor enthusiasts and nature lovers.',
        rating: 4.5,
        amenities: ['WiFi', 'Fireplace', 'Hiking', 'Restaurant', 'Parking', 'Ski Storage', 'Hot Tub'],
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'City Center Boutique Hotel',
        address: '321 Oak Avenue',
        city: 'Chicago',
        country: 'USA',
        description: 'Chic boutique hotel in the heart of the city. Modern design with personalized service and unique character.',
        rating: 4.4,
        amenities: ['WiFi', 'Restaurant', 'Bar', 'Rooftop Terrace', 'Fitness Center', 'Concierge'],
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'Sunset Paradise Resort',
        address: '567 Coconut Drive',
        city: 'Honolulu',
        country: 'USA',
        description: 'Tropical paradise resort with stunning sunset views. Experience luxury and relaxation in a beautiful setting.',
        rating: 4.7,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Tennis Courts', 'Golf Course'],
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      },
    }),
  ]);
  console.log(`✅ ${hotels.length} hotels created`);

  // ==================== ROOMS ====================
  console.log('\n🛏️ Creating rooms...');

  const roomData = [
    // Grand Plaza Hotel - New York
    { hotelId: hotels[0].id, roomNumber: '101', type: RoomType.SUITE, pricePerNight: 299.99, capacity: 2, amenities: ['King Bed', 'Ocean View', 'Mini Bar', 'Smart TV', 'Jacuzzi'] },
    { hotelId: hotels[0].id, roomNumber: '102', type: RoomType.DELUXE, pricePerNight: 199.99, capacity: 2, amenities: ['Queen Bed', 'City View', 'Coffee Maker', 'Smart TV', 'Desk'] },
    { hotelId: hotels[0].id, roomNumber: '103', type: RoomType.STANDARD, pricePerNight: 149.99, capacity: 2, amenities: ['Double Bed', 'Coffee Maker', 'TV', 'Desk'] },
    { hotelId: hotels[0].id, roomNumber: '104', type: RoomType.DOUBLE, pricePerNight: 179.99, capacity: 4, amenities: ['Two Queen Beds', 'City View', 'Smart TV', 'Desk'] },
    { hotelId: hotels[0].id, roomNumber: '105', type: RoomType.SINGLE, pricePerNight: 129.99, capacity: 1, amenities: ['Twin Bed', 'TV', 'Desk'] },
    
    // Ocean View Resort - Miami
    { hotelId: hotels[1].id, roomNumber: '201', type: RoomType.SUITE, pricePerNight: 349.99, capacity: 4, amenities: ['King Bed', 'Ocean View', 'Jacuzzi', 'Mini Bar', 'Smart TV', 'Balcony'] },
    { hotelId: hotels[1].id, roomNumber: '202', type: RoomType.DOUBLE, pricePerNight: 249.99, capacity: 4, amenities: ['Two Queen Beds', 'Ocean View', 'Coffee Maker', 'Smart TV', 'Balcony'] },
    { hotelId: hotels[1].id, roomNumber: '203', type: RoomType.DELUXE, pricePerNight: 229.99, capacity: 2, amenities: ['Queen Bed', 'Ocean View', 'Coffee Maker', 'Smart TV', 'Desk'] },
    { hotelId: hotels[1].id, roomNumber: '204', type: RoomType.STANDARD, pricePerNight: 169.99, capacity: 2, amenities: ['Double Bed', 'Smart TV', 'Desk'] },
    
    // Mountain View Lodge - Denver
    { hotelId: hotels[2].id, roomNumber: '301', type: RoomType.DELUXE, pricePerNight: 179.99, capacity: 2, amenities: ['Queen Bed', 'Mountain View', 'Fireplace', 'Coffee Maker', 'Smart TV'] },
    { hotelId: hotels[2].id, roomNumber: '302', type: RoomType.STANDARD, pricePerNight: 129.99, capacity: 2, amenities: ['Double Bed', 'Mountain View', 'TV', 'Desk'] },
    { hotelId: hotels[2].id, roomNumber: '303', type: RoomType.SUITE, pricePerNight: 259.99, capacity: 4, amenities: ['King Bed', 'Mountain View', 'Fireplace', 'Jacuzzi', 'Mini Bar', 'Smart TV'] },
    { hotelId: hotels[2].id, roomNumber: '304', type: RoomType.SINGLE, pricePerNight: 99.99, capacity: 1, amenities: ['Twin Bed', 'Mountain View', 'TV'] },
    
    // City Center Boutique Hotel - Chicago
    { hotelId: hotels[3].id, roomNumber: '401', type: RoomType.DELUXE, pricePerNight: 189.99, capacity: 2, amenities: ['Queen Bed', 'City View', 'Coffee Maker', 'Smart TV', 'Desk'] },
    { hotelId: hotels[3].id, roomNumber: '402', type: RoomType.STANDARD, pricePerNight: 139.99, capacity: 2, amenities: ['Double Bed', 'Smart TV', 'Desk'] },
    { hotelId: hotels[3].id, roomNumber: '403', type: RoomType.SUITE, pricePerNight: 279.99, capacity: 2, amenities: ['King Bed', 'City View', 'Mini Bar', 'Smart TV', 'Jacuzzi'] },
    
    // Sunset Paradise Resort - Honolulu
    { hotelId: hotels[4].id, roomNumber: '501', type: RoomType.SUITE, pricePerNight: 399.99, capacity: 4, amenities: ['King Bed', 'Ocean View', 'Jacuzzi', 'Mini Bar', 'Smart TV', 'Balcony'] },
    { hotelId: hotels[4].id, roomNumber: '502', type: RoomType.DELUXE, pricePerNight: 279.99, capacity: 2, amenities: ['Queen Bed', 'Ocean View', 'Coffee Maker', 'Smart TV', 'Balcony'] },
    { hotelId: hotels[4].id, roomNumber: '503', type: RoomType.DOUBLE, pricePerNight: 329.99, capacity: 4, amenities: ['Two Queen Beds', 'Ocean View', 'Smart TV', 'Balcony'] },
    { hotelId: hotels[4].id, roomNumber: '504', type: RoomType.STANDARD, pricePerNight: 199.99, capacity: 2, amenities: ['Double Bed', 'Smart TV', 'Desk'] },
  ];

  const rooms = await Promise.all(
    roomData.map((data) =>
      prisma.room.create({
        data: {
          ...data,
          isAvailable: true,
          images: [],
        },
      })
    )
  );
  console.log(`✅ ${rooms.length} rooms created`);

  // ==================== BOOKINGS ====================
  console.log('\n📅 Creating bookings...');

  const today = new Date();
  
  // Helper to add days to a date
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Sample bookings with different statuses
  const bookingData = [
    // Confirmed bookings
    {
      userId: users[0].id,
      roomId: rooms[0].id,
      checkInDate: addDays(today, 7),
      checkOutDate: addDays(today, 10),
      totalPrice: 899.97,
      status: BookingStatus.CONFIRMED,
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      guestPhone: '+1234567890',
      specialRequests: 'Extra pillows, Late check-in, Room with a view', // Changed to string
    },
    {
      userId: users[1].id,
      roomId: rooms[5].id,
      checkInDate: addDays(today, 14),
      checkOutDate: addDays(today, 17),
      totalPrice: 1049.97,
      status: BookingStatus.CONFIRMED,
      guestName: 'Jane Smith',
      guestEmail: 'jane@example.com',
      guestPhone: '+1234567891',
      specialRequests: 'Ocean view room, Extra towels',
    },
    {
      userId: users[2].id,
      roomId: rooms[10].id,
      checkInDate: addDays(today, 21),
      checkOutDate: addDays(today, 24),
      totalPrice: 779.97,
      status: BookingStatus.CONFIRMED,
      guestName: 'Robert Johnson',
      guestEmail: 'robert@example.com',
      guestPhone: '+1234567892',
      specialRequests: 'Mountain view, Fireplace',
    },
    // Pending bookings
    {
      userId: users[0].id,
      roomId: rooms[2].id,
      checkInDate: addDays(today, 30),
      checkOutDate: addDays(today, 33),
      totalPrice: 449.97,
      status: BookingStatus.PENDING,
      guestName: 'Sarah Wilson',
      guestEmail: 'sarah@example.com',
      guestPhone: '+1234567893',
      specialRequests: 'Quiet room, Extra blankets',
    },
    {
      userId: users[3].id,
      roomId: rooms[14].id,
      checkInDate: addDays(today, 35),
      checkOutDate: addDays(today, 38),
      totalPrice: 839.97,
      status: BookingStatus.PENDING,
      guestName: 'Michael Brown',
      guestEmail: 'michael@example.com',
      guestPhone: '+1234567894',
      specialRequests: 'City view, Early check-in',
    },
    // Checked in
    {
      userId: users[1].id,
      roomId: rooms[3].id,
      checkInDate: addDays(today, -2),
      checkOutDate: addDays(today, 1),
      totalPrice: 539.97,
      status: BookingStatus.CHECKED_IN,
      guestName: 'Emily Davis',
      guestEmail: 'emily@example.com',
      guestPhone: '+1234567895',
      specialRequests: 'Extra pillows, Late check-out',
    },
    {
      userId: users[2].id,
      roomId: rooms[8].id,
      checkInDate: addDays(today, -5),
      checkOutDate: addDays(today, -2),
      totalPrice: 509.97,
      status: BookingStatus.CHECKED_IN,
      guestName: 'David Miller',
      guestEmail: 'david@example.com',
      guestPhone: '+1234567896',
      specialRequests: '',
    },
    // Checked out
    {
      userId: users[3].id,
      roomId: rooms[6].id,
      checkInDate: addDays(today, -10),
      checkOutDate: addDays(today, -7),
      totalPrice: 749.97,
      status: BookingStatus.CHECKED_OUT,
      guestName: 'Lisa Anderson',
      guestEmail: 'lisa@example.com',
      guestPhone: '+1234567897',
      specialRequests: 'Beach view, Extra towels',
    },
    // Cancelled
    {
      userId: users[0].id,
      roomId: rooms[11].id,
      checkInDate: addDays(today, 45),
      checkOutDate: addDays(today, 48),
      totalPrice: 479.97,
      status: BookingStatus.CANCELLED,
      guestName: 'James Taylor',
      guestEmail: 'james@example.com',
      guestPhone: '+1234567898',
      specialRequests: 'Mountain view, Late check-in',
    },
    // More confirmed bookings
    {
      userId: users[1].id,
      roomId: rooms[15].id,
      checkInDate: addDays(today, 50),
      checkOutDate: addDays(today, 53),
      totalPrice: 839.97,
      status: BookingStatus.CONFIRMED,
      guestName: 'Maria Garcia',
      guestEmail: 'maria@example.com',
      guestPhone: '+1234567899',
      specialRequests: 'Ocean view, Extra pillows',
    },
    {
      userId: users[2].id,
      roomId: rooms[1].id,
      checkInDate: addDays(today, 55),
      checkOutDate: addDays(today, 58),
      totalPrice: 599.97,
      status: BookingStatus.CONFIRMED,
      guestName: 'Thomas Martinez',
      guestEmail: 'thomas@example.com',
      guestPhone: '+1234567800',
      specialRequests: 'City view, Early check-in',
    },
  ];

  const bookings = await Promise.all(
    bookingData.map((data) =>
      prisma.booking.create({
        data,
      })
    )
  );
  console.log(`✅ ${bookings.length} bookings created`);

  // ==================== SUMMARY ====================
  console.log('\n📊 Seed Summary:');
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.hotel.count()} hotels`);
  console.log(`   - ${await prisma.room.count()} rooms`);
  console.log(`   - ${await prisma.booking.count()} bookings`);

  console.log('\n🎉 Seed completed successfully!');
  
  console.log('\n📝 Admin Credentials:');
  console.log('   Email: admin@hotel.com');
  console.log('   Password: admin123');
  
  console.log('\n📝 Test User Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');

  console.log('\n🔗 Access Admin Dashboard:');
  console.log('   http://localhost:3000/admin');

  console.log('\n💾 View Database:');
  console.log('   npx prisma studio');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });