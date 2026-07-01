# Geomining.id Webinar Application

A modern, localized Next.js 14+ webinar and masterclass platform focused on geotechnical and mining engineering, built for [geomining.id](https://geomining.id).

## 🚀 Features

- **Internationalization (i18n):** Full support for English and Indonesian using `next-intl`.
- **Authentication:** Secure user login and registration powered by `next-auth` (Credentials & OAuth) and `bcrypt`.
- **Database:** PostgreSQL integration via `Prisma` ORM.
- **Modern UI:** Built with Tailwind CSS, Framer Motion, and shadcn/ui components.
- **Admin Dashboard:** Comprehensive management for webinars, speakers, coupons, users, and enrollments.
- **Payment Integration:** Secure checkout flows using Xendit.
- **Email Notifications:** Automated emails for registration and OTPs via Resend & React Email.
- **Media Management:** Cloudinary integration for handling speaker and webinar images.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Database:** PostgreSQL (with [Prisma Client](https://www.prisma.io/))
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Validation:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

## ⚙️ Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and PostgreSQL installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wangheryan/webinar-app.git
   cd webinar-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on the following template:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/webinar_db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Cloudinary
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

   # Resend
   RESEND_API_KEY="re_..."
   
   # Xendit
   XENDIT_SECRET_KEY="xnd_..."
   ```

4. **Database Migration & Seeding:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app`: Next.js App Router setup with `[locale]` dynamic routing for i18n.
- `src/components`: Reusable UI components (shadcn, features, layouts).
- `src/actions`: Next.js Server Actions for forms and data mutations.
- `src/services`: Business logic abstraction.
- `src/repositories`: Database access layer (Prisma wrappers).
- `src/messages`: Translation files (`en.json`, `id.json`).
- `prisma`: Database schema and seed scripts.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
