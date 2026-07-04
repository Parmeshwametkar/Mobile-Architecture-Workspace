import { CodeBlock, ApiEndpoint } from "./types";

export const MOCK_API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/v1/auth/login",
    description: "Authenticates client credentials using security filters. Emits a signed JWT & Refresh Token.",
    authRequired: false,
    bodyTemplate: JSON.stringify({
      email: "alex@aura-studio.com",
      password: "••••••••••••"
    }, null, 2),
    responseTemplate: JSON.stringify({
      success: true,
      message: "Authentication successful (JWT)",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTk4NDMiLCJuYW1lIjoiQWxleGFuZGVyIiwiZXhwIjoyNTcxNDUzNjAwfQ...",
      refreshToken: "ref_aura_k3b8d1v9",
      user: {
        id: "u-9843",
        name: "Alexander Wright",
        email: "alex@aura-studio.com",
        role: "Enterprise Admin",
        tier: "Premium Elite",
        balance: 4850.00,
        verified: true
      }
    }, null, 2)
  },
  {
    method: "POST",
    path: "/api/v1/auth/biometric",
    description: "Bypasses credentials using asymmetric device key authentication securely linked with Spring Security.",
    authRequired: false,
    bodyTemplate: JSON.stringify({
      biometricKey: "pub_aura_device_signature_98df89ca8f..."
    }, null, 2),
    responseTemplate: JSON.stringify({
      success: true,
      message: "Biometric authentication successful",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTk4NDMiLCJuYW1l...",
      user: {
        id: "u-9843",
        name: "Alexander Wright"
      }
    }, null, 2)
  },
  {
    method: "POST",
    path: "/api/v1/payments/charge",
    description: "Interacts server-side with Stripe/Google Pay APIs. Validates transaction and updates customer balance.",
    authRequired: true,
    bodyTemplate: JSON.stringify({
      amount: "29.99",
      currency: "USD",
      paymentMethod: "Google Pay",
      email: "alex@aura-studio.com"
    }, null, 2),
    responseTemplate: JSON.stringify({
      success: true,
      message: "Stripe/Google Pay charge successful",
      transactionId: "tx-aura-81093",
      amount: 29.99,
      currency: "USD",
      timestamp: "2026-07-03T23:28:00Z",
      newBalance: 4820.01
    }, null, 2)
  },
  {
    method: "GET",
    path: "/api/v1/transactions",
    description: "Retrieves user ledger history with full cursor pagination and dynamic query caching.",
    authRequired: true,
    responseTemplate: JSON.stringify({
      success: true,
      page: 1,
      limit: 3,
      totalCount: 4,
      totalPages: 2,
      hasMore: true,
      transactions: [
        { id: "tx-4081", title: "Aura Premium Cloud Sync", amount: -29.99, status: "completed", date: "2026-07-01T14:22:00Z", category: "Subscription" },
        { id: "tx-3921", title: "Stripe Wallet Refill", amount: 500.00, status: "completed", date: "2026-06-28T09:15:00Z", category: "Deposit" }
      ]
    }, null, 2)
  },
  {
    method: "GET",
    path: "/api/v1/analytics/dashboard",
    description: "Queries high-speed Redis caching layers and MySQL partitions to return diagnostic series.",
    authRequired: false,
    responseTemplate: JSON.stringify({
      success: true,
      summary: {
        activeUsers24h: 18450,
        apiSuccessRate: "99.94%",
        redisCacheHitRate: "89.4%",
        averageLatencyMs: 42
      }
    }, null, 2)
  }
];

export const SQL_SCHEMA = `-- Enterprise Aura Application Database Schema (MySQL 8.0 compatible)
-- Engineered for high-throughput with index optimization, partitioned transactions, and strict foreign keys

CREATE DATABASE IF NOT EXISTS aura_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aura_db;

-- 1. Users Table (Core Auth Entity)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(30) DEFAULT 'USER',
    tier VARCHAR(30) DEFAULT 'STANDARD',
    biometrics_enabled BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_joined (joined_at)
) ENGINE=InnoDB;

-- 2. User Biometric Keys (Asymmetric Public Key Store)
CREATE TABLE IF NOT EXISTS user_biometrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    public_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_device (user_id, device_id)
) ENGINE=InnoDB;

-- 3. Transactions Table (Ledger Entries - Partition Friendly)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    category VARCHAR(50) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- 4. Push Notification Tokens
CREATE TABLE IF NOT EXISTS push_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device_token VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(10) NOT NULL, -- 'android' or 'ios'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Redis Cache Schema Map:
-- Key Pattern: user_profiles::[id] -> hash { id, name, email, tier, balance } (Uptime: 24h)
-- Key Pattern: locations_list -> serialized list JSON (Uptime: 60 min)
-- Key Pattern: rate_limit::[ip_address] -> integer (Expiry: 1 minute sliding window)
`;

export const CODE_BLOCKS: CodeBlock[] = [
  {
    title: "Spring Security 6 Config",
    language: "java",
    description: "Enterprise Security filter chain utilizing strict CORS policies, stateless JWT checks, and permission scopes.",
    fileName: "SecurityConfig.java",
    category: "backend",
    code: `package com.aura.config;

import com.aura.security.JwtAuthenticationFilter;
import com.aura.security.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*")); // Lock down in production
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Robust BCrypt workload strength
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`
  },
  {
    title: "REST Auth Controller",
    language: "java",
    description: "Spring Boot controller that supports secure email-password login, OTP, and local biometrics key verifications.",
    fileName: "AuthenticationController.java",
    category: "backend",
    code: `package com.aura.controller;

import com.aura.dto.AuthResponse;
import com.aura.dto.LoginRequest;
import com.aura.dto.BiometricLoginRequest;
import com.aura.dto.OtpVerifyRequest;
import com.aura.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticateWithEmail(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/biometric")
    public ResponseEntity<AuthResponse> loginBiometric(@Valid @RequestBody BiometricLoginRequest request) {
        AuthResponse response = authService.authenticateWithBiometrics(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        AuthResponse response = authService.verifyOneTimePassword(request);
        return ResponseEntity.ok(response);
    }
}`
  },
  {
    title: "JWT Token Engine",
    language: "java",
    description: "Signs and validates HMAC-256 tokens using secure, environment-injected credentials and timestamps.",
    fileName: "JwtTokenProvider.java",
    category: "backend",
    code: `package com.aura.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("\${app.jwt.secret}")
    private String jwtSecret;

    @Value("\${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities());
        
        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Log security warnings or token expirations here
            return false;
        }
    }
}`
  },
  {
    title: "Docker Orchestration",
    language: "yaml",
    description: "Production docker-compose script provisioning the Spring Boot service, clustered Redis cache, and MySQL db.",
    fileName: "docker-compose.yml",
    category: "config",
    code: `version: '3.8'

services:
  # 1. Spring Boot 3 Web Application Container
  aura-backend-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: aura-api-service
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/aura_db?useSSL=false&allowPublicKeyRetrieval=true
      - SPRING_DATASOURCE_USERNAME=aura_admin
      - SPRING_DATASOURCE_PASSWORD=AuraSecurityP@ssword2026
      - SPRING_DATA_REDIS_HOST=redis-cache
      - SPRING_DATA_REDIS_PORT=6379
      - APP_JWT_SECRET=YXVyYVNlY3JldFNpZ25hdHVyZTIwMjZfc3VwZXJfZGVlcF9zZWN1cmVfa2V5XzEyMzQ1Njc4OQ==
      - APP_JWT_EXPIRATION_MS=86400000
    depends_on:
      mysql-db:
        condition: service_healthy
      redis-cache:
        condition: service_healthy
    networks:
      - aura-bridge-network

  # 2. Database Service: MySQL 8.0
  mysql-db:
    image: mysql:8.0
    container_name: aura-mysql-db
    restart: always
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=aura_db
      - MYSQL_USER=aura_admin
      - MYSQL_PASSWORD=AuraSecurityP@ssword2026
      - MYSQL_ROOT_PASSWORD=AuraRootSecurity2026
    volumes:
      - aura-db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - aura-bridge-network

  # 3. High Performance Cache Service: Redis
  redis-cache:
    image: redis:7-alpine
    container_name: aura-redis-cache
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - aura-cache-data:/data
    command: redis-server --appendonly yes --requirepass RedisAuraP@ss2026
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "RedisAuraP@ss2026", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - aura-bridge-network

volumes:
  aura-db-data:
  aura-cache-data:

networks:
  aura-bridge-network:
    driver: bridge`
  },
  {
    title: "Flutter BLoC state manager",
    language: "dart",
    description: "Flutter business logic component (BLoC) orchestrating state events for seamless, reactive asynchronous logins.",
    fileName: "auth_bloc.dart",
    category: "frontend",
    code: `import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

// --- EVENTS ---
abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class LoginWithEmailRequested extends AuthEvent {
  final String email;
  final String password;

  const LoginWithEmailRequested({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class BiometricLoginRequested extends AuthEvent {
  final String secureKey;
  const BiometricLoginRequested(this.secureKey);

  @override
  List<Object?> get props => [secureKey];
}

class LogoutRequested extends AuthEvent {}

// --- STATES ---
abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  final String token;

  const AuthAuthenticated({required this.user, required this.token});

  @override
  List<Object?> get props => [user, token];
}
class AuthUnauthenticated extends AuthState {}
class AuthError extends AuthState {
  final String errorMessage;
  const AuthError(this.errorMessage);

  @override
  List<Object?> get props => [errorMessage];
}

// --- BLOC ---
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<LoginWithEmailRequested>(_onLoginWithEmailRequested);
    on<BiometricLoginRequested>(_onBiometricLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginWithEmailRequested(
    LoginWithEmailRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final authData = await authRepository.loginWithEmail(event.email, event.password);
      emit(AuthAuthenticated(user: authData.user, token: authData.token));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onBiometricLoginRequested(
    BiometricLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final authData = await authRepository.loginWithBiometrics(event.secureKey);
      emit(AuthAuthenticated(user: authData.user, token: authData.token));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    await authRepository.clearLocalSession();
    emit(AuthUnauthenticated());
  }
}`
  },
  {
    title: "Flutter MD3 Login UI",
    language: "dart",
    description: "Responsive Flutter login page featuring Material Design 3 form inputs, error validation, and custom animations.",
    fileName: "login_screen.dart",
    category: "frontend",
    code: `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const DashboardScreen()),
            );
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage),
                backgroundColor: theme.colorScheme.error,
              ),
            );
          }
        },
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Identity Hero Section
                    Icon(
                      Icons.blur_on_rounded,
                      size: 72,
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Welcome to Aura',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        letterSpacing: -0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Unified Corporate Wallet & Workspace',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onBackground.withOpacity(0.6),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 40),

                    // Email Field
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                        labelText: 'Corporate Email',
                        prefixIcon: const Icon(Icons.email_outlined),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Email is required';
                        }
                        if (!RegExp(r'^[^@]+@[^@]+\\.[^@]+').hasMatch(value)) {
                          return 'Invalid email format';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),

                    // Password Field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Security Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Password is required';
                        }
                        if (value.length < 8) {
                          return 'Must be at least 8 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 32),

                    // Active Submit Button
                    BlocBuilder<AuthBloc, AuthState>(
                      builder: (context, state) {
                        if (state is AuthLoading) {
                          return const Center(child: CircularProgressIndicator());
                        }
                        return FilledButton(
                          onPressed: _submitForm,
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text('Sign In Securely'),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      BlocProvider.of<AuthBloc>(context).add(
        LoginWithEmailRequested(
          email: _emailController.text,
          password: _passwordController.text,
        ),
      );
    }
  }
}`
  },
  {
    title: "Flutter Bento Dashboard",
    language: "dart",
    description: "Responsive Flutter dashboard implementing standard Material 3 grids, pagination controllers, and pull-to-refresh widgets.",
    fileName: "dashboard_screen.dart",
    category: "frontend",
    code: `import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../bloc/transaction_controller.dart';
import '../models/transaction_model.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _scrollController = ScrollController();
  final _txController = TransactionController();
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _txController.fetchInitialLedger();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() async {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      if (!_isLoadingMore && _txController.hasMoreRecords) {
        setState(() => _isLoadingMore = true);
        await _txController.fetchNextPage();
        setState(() => _isLoadingMore = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Aura Space', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined),
            onPressed: () {},
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _txController.fetchInitialLedger(force: true),
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // 1. Bento Stat Header
            SliverPadding(
              padding: const EdgeInsets.all(16.0),
              sliver: SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Balance',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onPrimary.withOpacity(0.8),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '\\$4,850.00',
                        style: theme.textTheme.headlineLarge?.copyWith(
                          color: theme.colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // 2. Bento Actions Quick Navigation Grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              sliver: SliverGrid.count(
                crossAxisCount: 3,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.1,
                children: [
                  _buildQuickAction(context, Icons.swap_horiz, 'Transfer'),
                  _buildQuickAction(context, Icons.qr_code, 'Scan Pay'),
                  _buildQuickAction(context, Icons.map_outlined, 'Aura Map'),
                ],
              ),
            ),

            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
                child: Text(
                  'Transaction Ledger',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ),

            // 3. Dynamic Paginated Transactions List
            StreamBuilder<List<Transaction>>(
              stream: _txController.transactionsStream,
              builder: (context, snapshot) {
                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildSkeletonItem(),
                      childCount: 3,
                    ),
                  );
                }

                final txList = snapshot.data!;
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index == txList.length) {
                        return _isLoadingMore 
                          ? const Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Center(child: CircularProgressIndicator()),
                            )
                          : const SizedBox();
                      }
                      
                      final tx = txList[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: tx.amount < 0 
                            ? Colors.red.withOpacity(0.1) 
                            : Colors.green.withOpacity(0.1),
                          child: Icon(
                            tx.amount < 0 ? Icons.arrow_outward : Icons.arrow_downward,
                            color: tx.amount < 0 ? Colors.red : Colors.green,
                          ),
                        ),
                        title: Text(tx.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(tx.category),
                        trailing: Text(
                          '\\$' + '{tx.amount.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: tx.amount < 0 ? Colors.black : Colors.green,
                          ),
                        ),
                      );
                    },
                    childCount: txList.length + 1,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, IconData icon, String label) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      color: theme.colorScheme.surfaceVariant,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: theme.colorScheme.primary),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildSkeletonItem() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListTile(
        leading: const CircleAvatar(backgroundColor: Colors.white),
        title: Container(height: 14, color: Colors.white),
        subtitle: Container(height: 10, color: Colors.white),
      ),
    );
  }
}`
  }
];
