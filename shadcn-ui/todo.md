# Ezidcode AI System - MVP Development Todo List

## Project Overview
Building a recursive self-upgrading AI system with web interface, multi-core architecture, and strategic command control.

## Core Files to Create (8 files max)

### 1. Authentication & User Management
- [ ] `src/lib/auth.ts` - Authentication logic and user session management
- [ ] `src/pages/Login.tsx` - Login page component
- [ ] `src/pages/Register.tsx` - Registration page component

### 2. Main Chat Interface
- [ ] `src/pages/Index.tsx` - Public chat interface (rewrite existing)
- [ ] `src/lib/chatLogic.ts` - Chat logic with 500-word limit for guests

### 3. Father Interface (Admin Control)
- [ ] `src/pages/Father.tsx` - Admin control panel at /father route
- [ ] `src/lib/coreSystem.ts` - Core system simulation (cloning, hibernation, upgrade protocol)

### 4. App Router Update
- [ ] `src/App.tsx` - Update routes to include /father, /login, /register

## Implementation Strategy
1. Start with authentication system (localStorage-based for MVP)
2. Build main chat interface with word count limit
3. Implement Father interface with strategic command input
4. Create core system simulation showing multi-core architecture
5. Connect all components with proper routing

## Design Principles
- Clean, professional UI using Shadcn components
- Responsive design for all screen sizes
- Smooth animations and transitions
- No mention of "self-upgrade" or "learning" on public pages
- Multi-language support (detect and respond in user's language)

## Technical Stack
- React + TypeScript
- Shadcn-UI components
- Tailwind CSS
- React Router for navigation
- LocalStorage for MVP data persistence
