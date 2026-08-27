Disclaimer: This side project is still in development, not yet stable. Sorry for the inconveniences. 

# Hotel Booking System

A full-stack hotel booking platform built with Next.js, Prisma, and PostgreSQL.

## Features

### User Features
- User authentication (Login/Register)
- Browse hotels with search and filter
- View hotel details and available rooms
- Book rooms with date selection
- Automatic price calculation
- User profile and booking history

### Admin Features
- Dashboard with analytics
- Hotel management (CRUD)
- Room management with availability
- Booking management
- User management
- System settings

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt
- **UI Icons:** Lucide React

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/hotel-booking-system.git
cd hotel-booking-system
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials
\`\`\`

4. Set up the database
\`\`\`bash
npx prisma db push --force-reset
npx prisma db seed
\`\`\`

5. Start the development server
\`\`\`bash
npm run dev
\`\`\`

6. Access the application
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- Prisma Studio: http://localhost:5555

## Test Credentials

### Admin Access
- Email: admin@hotel.com
- Password: admin123

### User Access
- Email: test@example.com
- Password: password123

##  Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository on Vercel
3. Add environment variables
4. Deploy!

### Environment Variables Required
\`\`\`
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
\`\`\`

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check` - Check auth status

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/[id]` - Get hotel details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/hotels` - Manage hotels
- `GET /api/admin/rooms` - Manage rooms
- `GET /api/admin/bookings` - Manage bookings
- `GET /api/admin/users` - Manage users

##  Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All open-source contributors

---
Built with using Next.js
