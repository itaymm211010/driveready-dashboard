# DriveReady Dashboard

A comprehensive driving school management system for instructors to manage students, lessons, skill tracking, and progress reporting.

## 🎯 Overview

DriveReady Dashboard is a modern web application designed to streamline driving school operations. It enables instructors to:
- Track student progress and skill development
- Manage lesson scheduling and execution
- Monitor payments and student balances
- Generate detailed progress reports
- Customize skill categories based on teaching methodology

## ✨ Features

### For Instructors
- **Daily Dashboard** - View today's scheduled lessons and activities
- **Active Lesson Management** - Real-time lesson tracking with start/pause/end controls
- **Student Management** - Add, edit, and track student information and balances
- **Skill Tracking System** - Hierarchical skill categories with proficiency levels
- **Calendar View** - Schedule and manage lessons with visual calendar interface
- **Progress Reports** - Generate comprehensive student readiness reports
- **Lesson History** - Complete audit trail of all lessons and skill practice

### System Features
- **Accessibility** - Font size selector and dark/light theme support
- **Real-time Updates** - Live data synchronization via Supabase
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Type Safety** - Full TypeScript implementation for reliability

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library built on Radix UI
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling with Zod validation
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations

### Backend & Infrastructure
- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Lovable** - Development and deployment platform

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account** (free tier available at [supabase.com](https://supabase.com))
- **Git** for version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/itaymm211010/driveready-dashboard.git
cd driveready-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (takes ~2 minutes)
3. Note your project URL and anon key from Project Settings → API

#### Run Database Migrations
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Push migrations to your database
supabase db push
```

Alternatively, you can manually run the SQL migrations from the `supabase/migrations` folder in your Supabase SQL Editor.

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To find these values:**
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings → API**
3. Copy the **Project URL** and **anon public** key

### 5. Set Up Row Level Security (RLS)

**IMPORTANT:** Ensure you configure Supabase RLS policies to secure your data:

```sql
-- Example: Teachers can only see their own students
CREATE POLICY "Teachers can view their students"
ON students FOR SELECT
USING (auth.uid() = teacher_id);

-- Add similar policies for all tables
```

Refer to `supabase/migrations` for the complete schema and recommended policies.

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
driveready-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── shared/         # Shared components
│   │   ├── teacher/        # Teacher-specific components
│   │   └── ui/             # UI component library (shadcn)
│   ├── pages/              # Route pages
│   │   ├── teacher/        # Teacher dashboard pages
│   │   └── student/        # Student portal pages
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client and types
│   ├── lib/                # Utility functions
│   ├── data/               # Static data and constants
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Application entry point
├── supabase/
│   ├── migrations/         # Database migration files
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

## 🗄️ Database Schema

### Core Tables

- **students** - Student profiles (name, email, phone, balance, readiness percentage)
- **lessons** - Lesson records (scheduled/actual times, payment status, cancellation)
- **skill_categories** - Teacher-defined skill groups
- **skills** - Individual skills within categories
- **student_skills** - Student progress on each skill (status, practice count, proficiency)
- **skill_history** - Audit trail of skill practice during lessons
- **lesson_planned_skills** - Skills planned for upcoming lessons
- **lesson_time_log** - Detailed timestamps of lesson events

### Key Relationships

```
teachers (auth.users)
  └── students
      ├── lessons
      │   ├── skill_history
      │   ├── lesson_planned_skills
      │   └── lesson_time_log
      └── student_skills
          └── skills
              └── skill_categories
```

For detailed schema, see the auto-generated types in `src/integrations/supabase/types.ts`

## 🎨 Customization

### Adding New Skills
Teachers can create custom skill categories and skills through the UI. Skills are teacher-scoped, allowing different instructors to use their own methodology.

### Theming
The app supports light/dark themes. Customize Tailwind colors in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      // Modify these values
    }
  }
}
```

### Font Sizes
Built-in accessibility feature allows users to adjust font sizes. Configuration in `src/components/FontSizeProvider.tsx`

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm test            # Run tests (Vitest)
```

## 🚢 Deployment

### Via Lovable Platform
1. Push changes to your GitHub repository
2. In Lovable, go to **Share → Publish**
3. Your app will be deployed automatically

### Alternative Deployment (Vercel, Netlify)
```bash
# Build the project
npm run build

# Deploy the 'dist' folder to your hosting provider
```

**Environment Variables:** Remember to add your Supabase credentials to your hosting platform's environment variables.

## 🔐 Security Considerations

- [ ] Implement Row Level Security (RLS) policies in Supabase
- [ ] Never commit `.env` files to version control
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS in production
- [ ] Set up proper authentication flows
- [ ] Regularly update dependencies

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- None currently reported

## 📊 Roadmap

- [ ] Add payment integration (invoicing, receipts)
- [ ] SMS/Email notifications for lesson reminders
- [ ] Document management (licenses, certificates)
- [ ] Multi-teacher support for driving schools with multiple instructors
- [ ] Advanced analytics and reporting
- [ ] Student portal for self-service scheduling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Itay Maor**
- GitHub: [@itaymm211010](https://github.com/itaymm211010)
- Business: [Smartsoftweb](https://smartsoftweb.com) - Web Development (WordPress/WooCommerce)

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Backend powered by [Supabase](https://supabase.com)

---

**Need Help?** Open an issue on GitHub or contact the maintainer.
