<div align="center">
<img width="1200" height="475" alt="Yuva Classes Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Yuva Classes Admin Panel

**A modern, comprehensive learning management system (LMS) administration suite.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 🚀 Overview

The **Yuva Classes Admin Panel** is a powerful, production-grade management system designed to handle the complex requirements of a modern educational platform. Built with **React 19** and **Vite**, it offers a blazing-fast, responsive experience for managing students, courses, tests, blogs, and financial transactions.

## ✨ Key Features

- 📝 **Advanced Blog CMS**: A rich-text editor powered by Tiptap for creating engaging educational content.
- 🎓 **Rich Course Builder**: Comprehensive tools to design and structure complex course curricula.
- 🧪 **Testing System**: Dynamic test builder with detailed tracking of student attempts and performance.
- 👥 **Student Management**: Centralized dashboard for managing student profiles, progress, and communications.
- 💰 **Payment Tracking**: Integrated financial module to monitor transactions and subscription statuses.
- 📂 **Resource Library**: Centralized storage for educational materials and downloadable resources.
- 🔔 **Communications**: Real-time notification system and integrated messaging for seamless interaction.
- 🎨 **CMS Dashboard**: Direct control over the frontend appearance and dynamic site content.

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/), [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Backend as a Service**: [Supabase](https://supabase.com/) (Authentication, PostgreSQL Database, Storage)
- **Editor**: [Tiptap](https://tiptap.dev/)

## 🏁 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm** or **pnpm** or **yarn**

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/nehalgupta-yuvaclasses/ycm-admin-panel.git
    cd ycm-admin-panel
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Launch the development server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Generates the production build in the `dist/` directory.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs TypeScript checks to ensure code quality.
- `npm run clean`: Removes the `dist/` build artifacts.

## 📂 Project Structure

```text
src/
├── components/   # Reusable UI components (shadcn/radix)
├── features/     # Feature-specific logic (blogs, courses, tests, etc.)
├── hooks/        # Custom React hooks
├── lib/          # Configuration and utility libraries (supabase client, etc.)
├── pages/        # Main route-level components
├── services/     # API and external service integrations
├── stores/       # Zustand state stores
└── types/        # TypeScript interfaces and types
```

---

<div align="center">
Built with ❤️ for Yuva Classes.
</div>
