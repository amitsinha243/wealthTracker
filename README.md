# WealthTracker 💰

WealthTracker is a comprehensive, self-hosted personal finance and wealth management platform. It allows users to track their net worth, organize financial and physical assets, log expenses, manage shared group budgets, plan trips, and receive intelligent recommendations from an AI financial assistant.

---

## 🚀 Key Features

### 1. **Executive Dashboard**
- **Net Worth Tracker**: Aggregated visual representation of all assets, investments, and cash balances.
- **Asset Allocation**: Interactive pie charts showing asset distributions (Mutual Funds, Stocks, FDs, physical properties, etc.).
- **Monthly Cash Flow**: Tracks incoming versus outgoing cash flow with automatic budgeting progress bars.

### 2. **Investment & Asset Portfolios**
- **Financial Investments**: Track and manage Stocks, Mutual Funds, and Fixed Deposits (FDs) with maturity reminders.
- **Savings Accounts**: Manage cash balances across multiple bank accounts.
- **Physical Assets**: Register properties, precious metals (gold/silver), or vehicles, with attachment support for deeds and documents.

### 3. **Expense & Budget Management**
- **Category Logging**: Tag and categorize transactions to visualize spending behaviors.
- **Expense Books**: Create isolated ledgers for separate contexts (e.g., Household, Freelance, Personal).
- **Group Budgeting**: Share expense books with collaborators for group expense split calculation.

### 4. **Trip Expense Planner**
- Dedicated mode to log individual and group expenses during travels, including currency split calculation.

### 5. **AI Financial Assistant**
- Built-in financial advisor powered by local LLMs via **Spring AI (Ollama)**.
- Ask questions regarding your portfolios, get budget recommendations, or request monthly financial reviews.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router v6](https://reactrouter.com/)

### Backend
- **Framework**: [Spring Boot 3.2.0](https://spring.io/projects/spring-boot) (Java 17)
- **Database**: [MongoDB](https://www.mongodb.com/) (Spring Data MongoDB)
- **Security**: [Spring Security](https://spring.io/projects/spring-security) + **JSON Web Tokens (JWT)**
- **AI Engine**: [Spring AI Ollama](https://spring.io/projects/spring-ai) (Runs LLMs locally)
- **Email Service**: Spring Boot Mail (JavaMailSender)
- **Utilities**: Lombok, Jakarta Validation

---

## 📁 Project Structure

```
├── Backend/                 # Spring Boot Backend API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/wealthtracker/
│   │   │   │   ├── controller/      # REST API Controllers
│   │   │   │   ├── service/         # Business Logic Services
│   │   │   │   ├── repository/      # Spring Data MongoDB Repositories
│   │   │   │   ├── model/           # MongoDB Entities
│   │   │   │   ├── security/        # JWT Authentication Filter & Utilities
│   │   │   │   └── config/          # Spring & Security configuration
│   │   │   └── resources/
│   │   │       └── application.properties # Server, DB, JWT & Mail configuration
│   └── pom.xml              # Maven Dependencies configuration
│
├── src/                     # React Frontend
│   ├── components/          # Reusable UI components & ProtectedRoute
│   ├── config/              # API endpoints mapping
│   ├── contexts/            # React AuthContext with JWT parsing
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Dashboard pages (Assets, Expenses, Trips, etc.)
│   └── services/            # Frontend API service layer
│
├── package.json             # Frontend packages
└── vite.config.ts           # Vite configurations
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/downloads/)
- [Maven](https://maven.apache.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas connection)
- [Ollama](https://ollama.com/) (For local AI features)

---

### Backend Setup

1. **Start MongoDB**: Ensure your local MongoDB server is running on port `27017` (default).
2. **Start Ollama**:
   - Download and run Ollama.
   - Pull your preferred local LLM model (e.g., Llama 3):
     ```bash
     ollama pull llama3
     ```
3. **Configure Settings**:
   Edit `Backend/src/main/resources/application.properties` to specify your MongoDB URI, JWT secret, and SMTP mail configuration.
4. **Build and Run**:
   Navigate to the Backend directory and run the application:
   ```bash
   cd Backend
   mvn clean install
   mvn spring-boot:run
   ```

---

### Frontend Setup

1. **Install Dependencies**:
   From the project root directory, run:
   ```bash
   npm install
   ```
2. **Set API Endpoint**:
   Check configuration in `src/config/api.ts` and ensure the `API_BASE_URL` matches your local backend URL:
   ```typescript
   export const API_BASE_URL = 'http://localhost:8080/api';
   ```
3. **Run Dev Server**:
   Start the local React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
