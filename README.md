# Gym Mine — Complete 90-Day Gym Workout Tracker & Transformation Application

A fully functional, responsive, and secure personal gym workout tracker engineered for an intermediate 6-day split with a dedicated daily Abs & Core module, progressive overload system, Indian vegetarian nutrition planner, body measurement tracking, and real-time set logging.

---

## 1. Athlete Profile & Program Details

- **Age**: 23
- **Weight**: 62 kg
- **Height**: 168 cm
- **Experience**: Intermediate
- **Goal**: Build muscle and gradually reduce body fat
- **Training Frequency**: 6 days per week (Monday to Saturday)
- **Workout Duration**: 60–90 minutes
- **Diet**: Vegetarian (High-protein Indian staples)
- **Equipment**: Commercial gym (barbells, dumbbells, cable stations, plate-loaded machines, racks)
- **Program Duration**: 90 Days (13 Weeks)
- **Rest Day**: Sunday (scheduled recovery with optional gentle mobility)

---

## 2. Technology Stack & Architecture

- **Frontend**: React.js with Vite (`client/`)
- **Styling**: Tailwind CSS with custom dark/light theme tokens and glowing accents
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Backend**: Node.js and Express.js REST API (`server/`)
- **Database**: SQLite default for zero-config immediate local usage, with complete PostgreSQL / Supabase migration compatibility via Prisma ORM
- **Authentication**: JWT token verification with bcrypt password hashing and user isolation
- **Charts**: Recharts (Volume by muscle, weight/waist trend, weekly consistency)
- **Image Handling**: High-resolution exercise images with SVG fallback illustration cards to prevent missing images

---

## 3. Implemented Application Pages & Modules

### A. Dashboard (`/`)
- Displays current program day (e.g. Day 1 of 90), current week (Week 1–13), and periodization phase.
- Today's date and scheduled strength split.
- Live completion percentage and progress bar for today's planned exercises.
- Active workout controls: **Start Workout**, **Resume Workout**, and **Finish Workout**.
- Dedicated **Abs & Core Module Banner** showing today's rotating core routine.
- Statistics: Overall plan completion %, workouts completed, active streak counter, total training minutes, current body weight, and weight trend area chart.

### B. 90-Day Workout Plan (`/plan`)
- Comprehensive 90-day interactive timeline across 13 weeks.
- Colored status badges: `Not started`, `In progress`, `Completed`, `Rest day`, `Missed`.
- Filter by week (Weeks 1 to 13) or view full 90 days.
- **Dynamic Start Date Manager**: Change your start date and instantly recalculate all 90 days.
- Click any day card to view scheduled workouts and exercise targets.

### C. Today's Workout (`/today`)
- **The Core Workout Engine**:
  - Exercise cards displaying photos, target sets × reps, suggested rest, equipment, and primary/secondary muscles.
  - Set-level input logging: Target weight, actual weight (kg), target reps, actual reps, Reps In Reserve (RIR 0–3+), and completion checkmark.
  - **Set-Level Persistence**: All set inputs persist to the database immediately; page refreshing does not erase progress.
  - **Live Workout Stopwatch**: Running in background, pause, start, and reset.
  - **Floating Rest Timer**: Triggers automatically on set completion with visual countdown progress, +30s / -15s / Skip buttons, and an audio chime.
  - **Exercise Details Modal**: Form cues, common mistakes, step-by-step instructions, and safety notes.
  - **Exercise Substitution Modal**: Search and replace any exercise in your routine.
  - **Workout Summary Modal**: Celebration modal showing total training time, total tonnage lifted (kg), total reps, and any newly unlocked Personal Records (PRs).

### D. Dedicated Abs & Core Module (`/core`)
- Completely separate from the strength workout with its own history and statistics.
- **Rotating Core Schedule**:
  - **Monday & Thursday (Core A)**: Cable crunch (3×12–15), Hanging knee raise (3×10–15), Pallof press (2×10–12/side).
  - **Tuesday & Friday (Core B)**: Reverse crunch (3×12–15), Front plank (3×30–45s), Dead bug (2×10/side).
  - **Wednesday & Saturday (Core C)**: Ab wheel rollout (2×6–10), Side plank (2×30–45s/side), Cable woodchop (2×10–12/side).
  - **Sunday (Recovery)**: Optional gentle mobility.
- **Interactive Plank Stopwatch**: Track isometric holds.
- **Evidence-Based Fitness Guidance**: Explains that abdominal training strengthens trunk stability but does not spot-reduce belly fat.
- Tracks core sessions completed, cumulative plank minutes, and total reps.

### E. Exercise Library (`/exercises`)
- Searchable directory of 47+ exercises covering Chest, Back, Shoulders, Biceps, Triceps, Forearms, Quads, Hamstrings, Glutes, Calves, and Core.
- Filter by Category and Difficulty level.
- High-resolution, movement-specific demonstration images and complete anatomical and cue breakdowns.
- **Add to Workout Plan**: Add any exercise directly from the library into any workout split or scheduled day (Push A/B, Pull A/B, Legs A/B, Core A/B/C) with customizable sets, target rep ranges, rest intervals, and RIR.

### F. Cardio Tracker (`/cardio`)
- Supported activities: Incline walking, Treadmill walking, Running, Cycling, Stair climber, Elliptical, Rowing machine, Other.
- Tracks duration, distance, incline percentage, speed, intensity, and notes.
- Weekly minutes progress gauge against user's target (e.g. 120 minutes/week).

### G. Vegetarian Nutrition Tracker (`/nutrition`)
- Tailored for high-protein Indian vegetarian diets.
- **Daily Protein Goal Progress Bar**: 100–125g target (default 115g/day).
- **Interactive Hydration Tracker**: Log glasses of water toward daily 3,000 ml target.
- **Meal Timing Logger**: Breakfast, Lunch, Snack, Dinner, Pre-workout, Post-workout.
- **Indian Vegetarian Food Directory**: Soy chunks, paneer, low-fat paneer, tofu, roasted chana, curd, greek yogurt, dal, rajma, chickpeas, oats, rice, roti, peanuts.
- **Budget-Friendly Substitutions Guide**: e.g., Soy chunks + curd smoothie vs expensive whey protein scoops.
- **One-Click Grocery Checklist**.

### H. Analytics & Progress (`/progress`)
- Recharts visualizations:
  - Weekly workout consistency.
  - Hypertrophy volume breakdown by primary muscle group (kg).
- Personal Records (PRs) table calculated using the Brzycki 1RM formula.

### I. Body Measurements (`/measurements`)
- Log body weight, waist circumference, chest, arm, thigh, and hip measurements.
- Visual comparison chart showing weight and waistline changes over time.
- Private records with no unauthorized third-party sharing.

### J. Profile & Settings (`/profile`)
- Edit athlete stats (Age, Weight, Height, Goal, Frequency, Units kg/lb).
- Recalculate program start date.
- Switch theme (Dark / Light mode).
- **Export All Data (JSON)**: Complete backup of all workouts, sets, measurements, and nutrition entries.
- **Reset Program**: Confirmed wipe of workout logs while preserving profile and baseline records.

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js (v18, v20, or higher)
- npm (v9 or higher)

### Installation
Clone or navigate to the workspace directory:
```bash
cd "gym mine"
```

Install root, server, and client dependencies:
```bash
npm run install:all
```

### Initialize Database & Seed
Run Prisma to create the SQLite database and seed all 47 exercises, 9 templates, the 90-day calendar, user profile, and baseline measurements:
```bash
cd server
npx prisma db push
node src/seed.js
cd ..
```

### Start Application (Frontend + Backend concurrently)
From the root directory:
```bash
npm run dev
```

- Frontend runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:5000`

---

## 5. Automated Tests

Run backend automated integration tests:
```bash
cd server
npm test
```
All integration tests cover health check, exercises query, Indian food database, today's workout structure, and rotating core routine.

---

## 6. Production Build & Deployment Guide

### Build Frontend
```bash
npm run build
```
Creates an optimized static bundle in `client/dist`.

### Deployment Options

#### Option A: Managed Fullstack (e.g. Render / Railway / Heroku)
1. Deploy `server/` as a Node.js web service.
2. Set Environment Variables:
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db" # Or your PostgreSQL URI
   JWT_SECRET="your_production_secret"
   NODE_ENV=production
   ```
3. Deploy `client/` to Vercel, Netlify, or serve statically via Express.

#### Option B: PostgreSQL / Supabase Migration
To switch from SQLite to PostgreSQL:
1. In `server/prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `server/.env` with your Supabase / PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public"
   ```
3. Run `npx prisma db push && node src/seed.js`.

---

## 7. Feature Implementation Checklist

| Feature | Status | Notes |
| :--- | :---: | :--- |
| Default User Profile (23 yo, 62kg, 168cm, Intermediate, Vegetarian) | ✅ | Fully seeded and editable in Settings |
| React.js + Vite Frontend | ✅ | Built with React 18, Vite 5, Tailwind CSS |
| Express.js REST API Backend | ✅ | Complete routes with JWT authentication |
| Prisma Database Schema & Migrations | ✅ | Real relational database schema with cascade rules |
| 6-Day Hypertrophy Split Seed Data (Push A/B, Pull A/B, Legs A/B) | ✅ | Exactly matching user's exercise prescriptions |
| Rotating Daily Abs & Core Module (Core A, B, C, Recovery) | ✅ | Dedicated page, plank stopwatch, independent stats |
| 90-Day Interactive Calendar with Week Calculations | ✅ | Day 1 to 90 with phases and start date recalculator |
| Real-time Set Logging with RIR & Persistence | ✅ | Immediate save on input change; survives refresh |
| Workout Timer & Floating Rest Timer with Audio Beep | ✅ | Integrated Web Audio API chime with skip/+30s controls |
| Exercise Image Handling with SVG Gradients | ✅ | Guaranteed zero broken images across all devices |
| Indian Vegetarian Nutrition Tracker | ✅ | 115g protein target, Indian foods DB, water counter |
| Body Measurements Tracker & Circumference Charts | ✅ | Weight, waist, chest, arm, thigh, hip comparisons |
| Cardio Tracker with Weekly Target Progress | ✅ | Incline, speed, distance, intensity, and duration logs |
| Recharts Analytics (Volume by Muscle, Consistency, PRs) | ✅ | Brzycki 1RM calculations & hypertrophy distribution |
| Dark / Light Mode Switcher | ✅ | Persistent theme with glowing cyber-cyan accents |
| Data Export & Confirmed Program Reset | ✅ | Full JSON data download and safe program reset |
| Automated Integration Test Suite | ✅ | Passing 5/5 test suite |
