import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// In-memory profile storage
let userProfile = {
  id: "u-9843",
  name: "Alexander Wright",
  email: "alex@aura-studio.com",
  role: "Enterprise Admin",
  tier: "Premium Elite",
  biometricsEnabled: true,
  pushNotifications: true,
  theme: "dark",
  balance: 4850.00,
  verified: true,
  joinedAt: "2026-01-15T08:30:00Z"
};

// Mock transaction history
let transactions = [
  { id: "tx-4081", title: "Aura Premium Cloud Sync", amount: -29.99, status: "completed", date: "2026-07-01T14:22:00Z", category: "Subscription" },
  { id: "tx-3921", title: "Stripe Wallet Refill", amount: 500.00, status: "completed", date: "2026-06-28T09:15:00Z", category: "Deposit" },
  { id: "tx-3810", title: "Google Pay API Fee", amount: -4.99, status: "completed", date: "2026-06-25T18:45:00Z", category: "Service Fee" },
  { id: "tx-3705", title: "Uber Developer API Charge", amount: -15.50, status: "completed", date: "2026-06-22T11:02:00Z", category: "Transport" }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize GoogleGenAI client to avoid startup crashes if key is missing
  let aiClient: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("GoogleGenAI initialized successfully with GEMINI_API_KEY.");
    } catch (err) {
      console.error("Error initializing GoogleGenAI:", err);
    }
  } else {
    console.log("No GEMINI_API_KEY detected. AI Chatbot will fall back to rule-based responses.");
  }

  // --- REST API MIDDLEWARE FOR AUTH TOKEN ---
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Simulate validating mock JWT
      next();
    } else {
      res.status(401).json({ error: "Unauthorized. Missing or invalid Bearer JWT token." });
    }
  };

  // --- REST API ENDPOINTS ---

  // Auth: Email & Password
  app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Standard hardcoded demo logic
    if (email === "alex@aura-studio.com") {
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTk4NDMiLCJuYW1lIjoiQWxleGFuZGVyIiwiZXhwIjoyNTcxNDUzNjAwfQ.auraSecretSignature";
      const mockRefreshToken = "ref_aura_" + Math.random().toString(36).substring(2, 15);
      return res.json({
        success: true,
        message: "Authentication successful (JWT)",
        token: mockToken,
        refreshToken: mockRefreshToken,
        user: userProfile
      });
    } else {
      // Create user
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LW5ldyIsIm5hbWUiOiJEZW1vIiwiZXhwIjoyNTcxNDUzNjAwfQ.auraSecretSignature";
      const newUser = {
        id: "u-" + Math.floor(Math.random() * 9000 + 1000),
        name: email.split("@")[0],
        email: email,
        role: "Standard User",
        tier: "Standard",
        biometricsEnabled: false,
        pushNotifications: true,
        theme: "light",
        balance: 100.00,
        verified: true,
        joinedAt: new Date().toISOString()
      };
      return res.json({
        success: true,
        message: "New user registered & authenticated (JWT)",
        token: mockToken,
        refreshToken: "ref_aura_" + Math.random().toString(36).substring(2, 15),
        user: newUser
      });
    }
  });

  // Auth: Biometric
  app.post("/api/v1/auth/biometric", (req, res) => {
    const { biometricKey } = req.body;
    if (!biometricKey) {
      return res.status(400).json({ error: "Biometric key payload required" });
    }
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTk4NDMiLCJuYW1lIjoiQWxleGFuZGVyIiwiZXhwIjoyNTcxNDUzNjAwfQ.auraSecretSignature";
    return res.json({
      success: true,
      message: "Biometric authentication successful",
      token: mockToken,
      user: userProfile
    });
  });

  // Auth: Google / Apple OAuth Simulation
  app.post("/api/v1/auth/social", (req, res) => {
    const { provider, socialToken } = req.body;
    if (!provider || !socialToken) {
      return res.status(400).json({ error: "Social login provider and token required" });
    }
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTk4NDMiLCJuYW1lIjoiQWxleGFuZGVyIiwiZXhwIjoyNTcxNDUzNjAwfQ.auraSecretSignature";
    return res.json({
      success: true,
      message: `Successfully authenticated via ${provider}`,
      token: mockToken,
      user: userProfile
    });
  });

  // OTP Verification
  app.post("/api/v1/auth/verify-otp", (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and 6-digit OTP code required" });
    }
    if (code === "123456" || code === "999999" || code.length === 6) {
      return res.json({
        success: true,
        message: "OTP validation successful",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTk4NDMiLCJuYW1lIjoiQWxleGFuZGVyIiwiZXhwIjoyNTcxNDUzNjAwfQ.auraSecretSignature",
        user: userProfile
      });
    }
    return res.status(400).json({ error: "Invalid OTP code" });
  });

  // Get User Profile
  app.get("/api/v1/profile", authMiddleware, (req, res) => {
    res.json({ success: true, user: userProfile });
  });

  // Update User Profile
  app.post("/api/v1/profile/update", authMiddleware, (req, res) => {
    const updates = req.body;
    userProfile = { ...userProfile, ...updates };
    res.json({ success: true, message: "Profile updated successfully", user: userProfile });
  });

  // GPS Map Locations
  app.get("/api/v1/locations", (req, res) => {
    // Return mock offices, servers, or partner booking properties (Airbnb-style)
    res.json({
      success: true,
      center: { lat: 37.7749, lng: -122.4194 },
      locations: [
        { id: "loc-1", title: "Aura Silicon Valley HQ", lat: 37.7749, lng: -122.4194, description: "Aura Engineering Center, San Francisco" },
        { id: "loc-2", title: "Aura London Hub", lat: 51.5074, lng: -0.1278, description: "European Ops and Security Division" },
        { id: "loc-3", title: "Aura Tokyo Tech Hub", lat: 35.6762, lng: 139.6503, description: "Design Lab and Asia-Pacific Office" }
      ]
    });
  });

  // Payment Gateway (Charge Simulation)
  app.post("/api/v1/payments/charge", authMiddleware, (req, res) => {
    const { amount, currency, paymentMethod, email } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Payment amount is required" });
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: "Invalid payment amount value" });
    }

    const transactionId = "tx-aura-" + Math.floor(Math.random() * 90000 + 10000);
    const newTx = {
      id: transactionId,
      title: `Aura Payment: ${paymentMethod || "Credit Card"}`,
      amount: -value,
      status: "completed",
      date: new Date().toISOString(),
      category: "Billing"
    };

    transactions.unshift(newTx);
    userProfile.balance -= value;

    res.json({
      success: true,
      message: "Stripe/Google Pay charge successful",
      transactionId: transactionId,
      amount: value,
      currency: currency || "USD",
      timestamp: new Date().toISOString(),
      newBalance: userProfile.balance
    });
  });

  // Get Transaction History (Pagination supported)
  app.get("/api/v1/transactions", authMiddleware, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pagedTxs = transactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      page: page,
      limit: limit,
      totalCount: transactions.length,
      totalPages: Math.ceil(transactions.length / limit),
      hasMore: endIndex < transactions.length,
      transactions: pagedTxs
    });
  });

  // Analytics Dashboard
  app.get("/api/v1/analytics/dashboard", (req, res) => {
    res.json({
      success: true,
      summary: {
        activeUsers24h: 18450,
        apiSuccessRate: "99.94%",
        redisCacheHitRate: "89.4%",
        averageLatencyMs: 42,
        activeSupportTickets: 3
      },
      userGrowth: [
        { month: "Jan", users: 5000 },
        { month: "Feb", users: 7800 },
        { month: "Mar", users: 12500 },
        { month: "Apr", users: 19400 },
        { month: "May", users: 27000 },
        { month: "Jun", users: 38500 }
      ],
      cacheStats: {
        keysCount: 1540,
        memoryUsedKb: 248,
        uptimeSeconds: 864000
      }
    });
  });

  // Gemini API-Powered Chat Support or Intelligent Fallback
  app.post("/api/v1/support/chat", async (req, res) => {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Chat message is required" });
    }

    // Try Gemini API if client initialized
    if (aiClient) {
      try {
        const systemInstruction = `You are a Senior Mobile Architect and AI Support Representative for 'Aura' mobile app ecosystem. 
        'Aura' is a futuristic, ultra-polished productivity and wallet application utilizing Flutter/React Native for frontend, Spring Boot 3 + Spring Security + Redis cache + MySQL for backend. 
        Answer user questions with technical competence, friendly customer care, and strict alignment to clean architecture or MVVM principles. 
        If the user asks about the screens, state management (BLoC), or deployment details, supply insightful tips or code summaries.
        Keep answers helpful, clear, and tailored to developer-grade requests.`;

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.8,
          }
        });

        return res.json({
          success: true,
          response: response.text || "I processed your request, but was unable to formulate a full answer. Let me know how else I can support your architectural needs."
        });
      } catch (err: any) {
        console.error("Gemini API call failed, falling back to static logic:", err);
        // Fall back gracefully
      }
    }

    // Interactive fallbacks based on keyword matches
    const lower = message.toLowerCase();
    let reply = "Hello! I am Aura's Architect Support Bot. I can help guide you through the Flutter + Spring Boot architecture code, explain the Clean Architecture patterns, show you how JWT filters work, or walk you through the database schemas.";

    if (lower.includes("jwt") || lower.includes("security") || lower.includes("auth")) {
      reply = "Our Spring Boot backend uses Spring Security 6 with JWT. The state is verified by a custom Stateless JWT Authentication Filter (`JwtAuthenticationFilter.java`). It intercepts each incoming request, extracts the Bearer token from the header, validates the signature, and populates the `SecurityContextHolder`. We handle passwords securely with `BCryptPasswordEncoder`. On Flutter, the token is stored in Secure Local Storage (e.g. Flutter Secure Storage package) and appended to the standard `Authorization: Bearer <token>` header in our HTTP Interceptors.";
    } else if (lower.includes("bloc") || lower.includes("state") || lower.includes("flutter")) {
      reply = "We use Flutter's official BLoC (Business Logic Component) pattern. This separates UI screens from business logic. The UI sends `AuthEvent`s (like `LoginWithEmailRequested`), the BLoC executes the asynchronous API request, and emits `AuthState` changes (such as `AuthLoading`, `AuthAuthenticated`, or `AuthError`). The UI reacts dynamically using `BlocBuilder` to draw states and `BlocListener` to handle one-off events like navigation and snackbars.";
    } else if (lower.includes("redis") || lower.includes("cache")) {
      reply = "To satisfy the Redis requirement, our Spring Boot 3 app integrates Spring Boot Starter Data Redis. We cache frequently requested, slow-changing entity profiles (like User details or partner maps locations) using the `@Cacheable(value = \"user_profiles\", key = \"#id\")` annotation. For high write throughput workloads, we implement the Cache-Aside pattern manually via `RedisTemplate<String, Object>` to ensure 100% data consistency with MySQL.";
    } else if (lower.includes("clean") || lower.includes("mvvm") || lower.includes("architecture")) {
      reply = "We enforce Enterprise Clean Architecture on both sides: \n\n1. Front-end (Flutter): Structured in layers: Presentation (UI Screens + BLoC viewmodels), Domain (Entities, Use Cases, Repositories definitions), and Data (Local Datasources, API Clients, Repository implementations).\n\n2. Back-end (Spring Boot): Divided into Controller (REST APIs), Service (Business use-cases), Repository (Data access via Hibernate JPA), and Domain (Database Entities). This fully decouples the DB schema from our core business rules!";
    } else if (lower.includes("docker") || lower.includes("deploy")) {
      reply = "Deployment is handled through standard Docker containers. The backend package compiles into an optimized JAR, containerized via a Multi-stage Dockerfile using openjdk:21-slim. We use `docker-compose.yml` to provision the Java Web service, a secure MySQL 8 instance, and a Redis container linked internally within an isolated overlay network.";
    } else if (lower.includes("payment") || lower.includes("stripe")) {
      reply = "Our Payment engine supports Stripe and Google Pay. The client securely requests a PaymentIntent token from our `/api/v1/payments/charge` Spring Boot controller. The Spring service interacts server-side with Stripe's Java SDK using the Stripe Secret Key to complete authentication. The client mobile app uses the Stripe Native SDK to securely authorize the card details directly without them touching our servers, maintaining strict PCI-DSS compliance.";
    }

    return res.json({
      success: true,
      response: reply
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Dev Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
