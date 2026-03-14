# CycleRent

Cycle rental platform — book a cycle, ride anywhere.

## Project structure

Rentalcycle/
├── cyclefront/   React + TypeScript + Vite frontend
└── cycletwo/     Node + Express + TypeScript + Prisma backend

## Running locally

### Backend
```bash
cd cycletwo
npm install
npx prisma db push
npx prisma generate
npm run dev
```
Runs on http://localhost:5000

### Frontend
```bash
cd cyclefront
npm install
npm run dev
```
Runs on http://localhost:3000

preview of the app
https://cycle-rental-git-main-yogi0011s-projects.vercel.app/

