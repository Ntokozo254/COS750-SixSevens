# COS212 Backend

This is the backend for the COS212 Hash Tables and Linear Probing app.

## Setup

1. Install dependencies:
## Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

## Getting Started

1. Install Node.js and npm:
   - Download and install Node.js from the official website: [https://nodejs.org](https://nodejs.org)
   - npm will be installed automatically with Node.js

2. Navigate to the server directory

3. Install the project dependencies: npm install


4. Set up the database connection:
   - The project uses a PostgreSQL database hosted on Neon.
   - The database connection URL is already provided in the `.env` file.

5. Run the database migrations: npx prisma migrate dev 


6. Start the development server: npm run dev


   The server will start running at `http://localhost:3000`.