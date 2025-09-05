# Heart Rate Monitor Dashboard

## Overview

This is a real-time heart rate monitoring application designed for medical professionals to track patient vital signs. The system provides a comprehensive dashboard for patient management, live heart rate monitoring, and health alerts with both frontend visualization and backend API services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with React and TypeScript, using a component-based architecture with the following key decisions:

- **UI Framework**: Utilizes Radix UI components with shadcn/ui styling for consistent, accessible interface elements
- **Styling**: Implements Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: Uses React hooks and TanStack Query for server state management and data fetching
- **Real-time Communication**: WebSocket connection for live heart rate data streaming
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for real-time heart rate visualization

### Backend Architecture
The server follows a REST API design with real-time capabilities:

- **Framework**: Express.js server with TypeScript for type safety
- **API Design**: RESTful endpoints for patient and heart rate data management
- **Real-time Features**: WebSocket server for live heart rate data streaming
- **Data Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware

### Data Storage Solutions
The application uses a hybrid storage approach:

- **Database**: PostgreSQL with Drizzle ORM for structured data persistence
- **Schema Management**: Drizzle migrations for database version control
- **Development Storage**: In-memory storage implementation for development/testing
- **Data Models**: Patients table with related heart rate readings table

### Authentication and Authorization
Currently implements a basic structure without authentication, designed to be extended with:
- Session-based authentication capabilities
- Role-based access control preparation
- Secure API endpoint protection

### Build and Development Tools
- **Bundling**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement and error overlay for rapid development
- **Deployment**: Node.js production server with static file serving
- **Type Checking**: TypeScript configuration for both client and server code

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting (`@neondatabase/serverless`)
- **Drizzle ORM**: Database toolkit and query builder (`drizzle-orm`, `drizzle-zod`)

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Charting library for data visualization

### Real-time and Data Management
- **WebSocket**: Native WebSocket API for real-time communication
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation

### Development and Build Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing and autoprefixing

### Validation and Utilities
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Utility for component variant management