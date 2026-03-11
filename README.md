# Pizza Azez

A full-stack mobile application built with React Native (Expo) and a Fastify backend, integrated with Supabase.

## Project Structure

The project is split into two main parts: the mobile frontend and the Node.js backend API.

- `/` (Root) - Mobile App (React Native + Expo)
- `backend/` - Backend Server (Node.js + Fastify)

## Technologies Used

### Frontend (Mobile App)
- **Framework:** React Native + Expo
- **Navigation:** React Navigation (v7)
- **Backend Service:** Supabase JS Client

### Backend (API Server)
- **Framework:** Fastify (Node.js)
- **Database / Auth:** Supabase
- **Authentication:** JWT (JSON Web Tokens) + Fastify JWT plugin
- **Security:** bcryptjs (for password hashing), Fastify CORS

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v21 recommended)
- npm or yarn
- [Expo Go](https://expo.dev/client) app installed on your physical device, or an iOS/Android emulator

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your Environment Variables (e.g., Supabase URL, keys, etc. - add an `.env` file if needed).
4. Start the backend server:
   ```bash
   npm start
   ```
   *(This runs `node server.js`)*

### 2. Setup Frontend
1. Open a new terminal and navigate to the project root directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code shown in the terminal with the Expo Go app.

## Available Scripts

### Frontend Scripts (Root Directory)
- `npm start`: Starts the Expo server.
- `npm run android`: Starts the app on an Android emulator/device.
- `npm run ios`: Starts the app on an iOS simulator.
- `npm run web`: Starts the Expo app in a web browser.

### Backend Scripts (`backend/` Directory)
- `npm start`: Starts the backend app.

## License
ISC
