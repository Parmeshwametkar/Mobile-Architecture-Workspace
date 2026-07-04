import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import {
  Smartphone,
  Server,
  Database,
  Layers,
  Code2,
  Terminal,
  Activity,
  Send,
  Lock,
  RefreshCw,
  MapPin,
  MessageSquare,
  CreditCard,
  Settings,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronRight,
  Sparkles,
  Wifi,
  Battery,
  Shield,
  KeyRound,
  FileText,
  TrendingUp,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Menu,
  Eye,
  EyeOff,
  Image,
  Calculator,
  Trash2,
  Plus,
  Camera,
  Heart,
  Check
} from "lucide-react";
import { CODE_BLOCKS, SQL_SCHEMA, MOCK_API_ENDPOINTS } from "./data";
import { EmulatorScreen, WorkspaceTab, User, Transaction, ChatMessage, CodeBlock } from "./types";

export default function App() {
  // --- WORKSPACE STATE ---
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(WorkspaceTab.OVERVIEW);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // --- EMULATOR STATE ---
  const [currentScreen, setCurrentScreen] = useState<EmulatorScreen>(EmulatorScreen.LOGIN);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>({
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
  });

  // Form Fields
  const [emailInput, setEmailInput] = useState<string>("alex@aura-studio.com");
  const [passwordInput, setPasswordInput] = useState<string>("AuraPass2026!");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);

  // Transactions list in emulator
  const [emulatorTransactions, setEmulatorTransactions] = useState<Transaction[]>([]);
  const [hasMoreTransactions, setHasMoreTransactions] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [pullingRefresh, setPullingRefresh] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Map settings
  const [selectedMapNode, setSelectedMapNode] = useState<any>(null);
  const [mapNodes, setMapNodes] = useState<any[]>([]);

  // Support Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: "Welcome to Aura's Enterprise Space. I can answer questions about our Flutter frontend state, Spring Boot JWT setup, or Redis caching. Try asking me: 'How does JWT security work?' or 'What state management do we use?'",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Payments Sandbox
  const [chargeAmount, setChargeAmount] = useState<string>("29.99");
  const [paymentMethod, setPaymentMethod] = useState<string>("Google Pay");
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // --- SAVINGS VAULTS STATE ---
  const [vaults, setVaults] = useState<any[]>([
    { id: "v-1", title: "Tesla Roadster Fund", target: 85000, saved: 42000, category: "Vehicle", icon: "🚗" },
    { id: "v-2", title: "Tokyo Summit Travel", target: 5000, saved: 3200, category: "Travel", icon: "✈️" },
    { id: "v-3", title: "Corporate Tax Pool", target: 12000, saved: 9800, category: "Tax", icon: "💼" }
  ]);
  const [newVaultTitle, setNewVaultTitle] = useState("");
  const [newVaultTarget, setNewVaultTarget] = useState("");
  const [newVaultCategory, setNewVaultCategory] = useState("Investments");
  const [selectedVaultId, setSelectedVaultId] = useState<string>("v-1");
  const [vaultAmountInput, setVaultAmountInput] = useState("");
  const [vaultActionType, setVaultActionType] = useState<"deposit" | "withdraw">("deposit");
  const [vaultSuccessMsg, setVaultSuccessMsg] = useState<string | null>(null);
  const [vaultErrorMsg, setVaultErrorMsg] = useState<string | null>(null);
  const [showCreateVaultForm, setShowCreateVaultForm] = useState(false);

  const handleVaultAction = (e: FormEvent) => {
    e.preventDefault();
    setVaultSuccessMsg(null);
    setVaultErrorMsg(null);

    const amount = parseFloat(vaultAmountInput);
    if (isNaN(amount) || amount <= 0) {
      setVaultErrorMsg("Please enter a valid transfer amount.");
      return;
    }

    const selectedVault = vaults.find(v => v.id === selectedVaultId);
    if (!selectedVault) {
      setVaultErrorMsg("Please select a target vault.");
      return;
    }

    if (vaultActionType === "deposit") {
      if (currentUser.balance < amount) {
        setVaultErrorMsg("Insufficient corporate ledger balance.");
        return;
      }

      // Deduct balance, add to vault
      setCurrentUser(prev => ({ ...prev, balance: prev.balance - amount }));
      setVaults(prev => prev.map(v => v.id === selectedVaultId ? { ...v, saved: v.saved + amount } : v));
      
      // Add ledger transaction
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        title: `Vault Deposit: ${selectedVault.title}`,
        amount: -amount,
        status: "SUCCESS",
        date: new Date().toISOString(),
        category: "Billing"
      };
      setEmulatorTransactions(prev => [newTx, ...prev]);

      setVaultSuccessMsg(`Successfully allocated \$${amount.toFixed(2)} to ${selectedVault.title}!`);
      addSysLog(`Vault allocation: \$${amount.toFixed(2)} moved to ${selectedVault.title}`);
    } else {
      if (selectedVault.saved < amount) {
        setVaultErrorMsg(`Insufficient savings. This vault only has \$${selectedVault.saved.toFixed(2)}.`);
        return;
      }

      // Add to balance, deduct from vault
      setCurrentUser(prev => ({ ...prev, balance: prev.balance + amount }));
      setVaults(prev => prev.map(v => v.id === selectedVaultId ? { ...v, saved: v.saved - amount } : v));

      // Add ledger transaction
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        title: `Vault Withdrawal: ${selectedVault.title}`,
        amount: amount,
        status: "SUCCESS",
        date: new Date().toISOString(),
        category: "Deposit"
      };
      setEmulatorTransactions(prev => [newTx, ...prev]);

      setVaultSuccessMsg(`Successfully retrieved \$${amount.toFixed(2)} from ${selectedVault.title}!`);
      addSysLog(`Vault retrieval: \$${amount.toFixed(2)} moved from ${selectedVault.title} to ledger`);
    }

    setVaultAmountInput("");
  };

  const handleCreateVault = (e: FormEvent) => {
    e.preventDefault();
    setVaultSuccessMsg(null);
    setVaultErrorMsg(null);

    if (!newVaultTitle.trim()) {
      setVaultErrorMsg("Please provide a name for the savings vault.");
      return;
    }

    const target = parseFloat(newVaultTarget);
    if (isNaN(target) || target <= 0) {
      setVaultErrorMsg("Please specify a valid savings target.");
      return;
    }

    const categoryIcons: { [key: string]: string } = {
      Vehicle: "🚗",
      Travel: "✈️",
      Tax: "💼",
      Investments: "📈",
      "Real Estate": "🏠",
      General: "💰"
    };

    const newVault = {
      id: `v-${Date.now()}`,
      title: newVaultTitle,
      target: target,
      saved: 0,
      category: newVaultCategory,
      icon: categoryIcons[newVaultCategory] || "💰"
    };

    setVaults(prev => [...prev, newVault]);
    setSelectedVaultId(newVault.id);
    setNewVaultTitle("");
    setNewVaultTarget("");
    setShowCreateVaultForm(false);
    setVaultSuccessMsg(`Savings vault "${newVault.title}" established successfully!`);
    addSysLog(`New vaults allocation registered: ${newVault.title} (Target \$${target.toFixed(2)})`);
  };

  // --- PHONE APPS STATE: GALLERY ---
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([
    {
      id: "ph-1",
      title: "HQ Server Core",
      category: "Infrastructure",
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=80",
      date: "2026-07-01",
      liked: true,
      details: "Rack A-14 Node Cluster, Main Ingress Frame"
    },
    {
      id: "ph-2",
      title: "Crypto Terminal Setup",
      category: "Workstations",
      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80",
      date: "2026-07-02",
      liked: false,
      details: "Quantum Ledger Dev Console v4.9"
    },
    {
      id: "ph-3",
      title: "Kyoto Summit Offices",
      category: "Architecture",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80",
      date: "2026-07-03",
      liked: false,
      details: "Aura Global Pacific Hub Exterior"
    },
    {
      id: "ph-4",
      title: "Prism Laser Diagnostics",
      category: "Abstract",
      url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=500&q=80",
      date: "2026-07-04",
      liked: true,
      details: "Refraction Index Calibration Matrix"
    }
  ]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [galleryCategory, setGalleryCategory] = useState<string>("All");
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [cameraSubject, setCameraSubject] = useState<string>("Quantum Grid");
  const [photoFilterLiked, setPhotoFilterLiked] = useState<boolean>(false);

  // --- PHONE APPS STATE: CALCULATOR ---
  const [calcDisplay, setCalcDisplay] = useState<string>("0");
  const [calcFormula, setCalcFormula] = useState<string>("");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  // --- PHONE APPS STATE: SECURE NOTES ---
  const [notes, setNotes] = useState<any[]>([
    {
      id: "nt-1",
      title: "Ledger Dev Key",
      category: "Confidential",
      content: "AES-256 Master Key Hash: 4e9f7832a10bcdef5c81b83e4a... Note: Keep encrypted under biometric login scope.",
      date: "2026-07-03"
    },
    {
      id: "nt-2",
      title: "Aura System Architecture",
      category: "Ideas",
      content: "Front-end: Flutter / Web Emulator\nBack-end: Spring Boot Microservices\nCache: Redis In-memory Key/Value store\nDB: Spanner High Resilience Relational database.",
      date: "2026-07-04"
    }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("General");
  const [notesSearchQuery, setNotesSearchQuery] = useState("");
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // --- PHONE APPS HANDLERS: GALLERY ---
  const handleTakePhoto = (e: FormEvent) => {
    e.preventDefault();
    const subjectToKeyword: { [key: string]: string } = {
      "Quantum Grid": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
      "Network Cluster": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=80",
      "Neon Architecture": "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=500&q=80",
      "Ledger Database": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=500&q=80"
    };

    const newPhoto = {
      id: `ph-${Date.now()}`,
      title: `${cameraSubject} Capture`,
      category: "Captured",
      url: subjectToKeyword[cameraSubject] || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
      date: new Date().toISOString().split("T")[0],
      liked: false,
      details: `Lens: AuraOptic-35mm • Shutter: 1/125s • Subject: ${cameraSubject}`
    };

    setGalleryPhotos(prev => [newPhoto, ...prev]);
    setCameraOpen(false);
    addSysLog(`Camera snapped new photographic target: ${newPhoto.title}`);
  };

  const handleDeletePhoto = (photoId: string) => {
    setGalleryPhotos(prev => prev.filter(ph => ph.id !== photoId));
    if (selectedPhotoId === photoId) {
      setSelectedPhotoId(null);
    }
    addSysLog(`Deleted image token ${photoId} from gallery storage`);
  };

  const handleToggleLikePhoto = (photoId: string) => {
    setGalleryPhotos(prev => prev.map(ph => ph.id === photoId ? { ...ph, liked: !ph.liked } : ph));
  };

  // --- PHONE APPS HANDLERS: CALCULATOR ---
  const handleCalcKeyPress = (key: string) => {
    if (key === "C") {
      setCalcDisplay("0");
      setCalcFormula("");
    } else if (key === "⌫") {
      if (calcFormula.length > 0) {
        const nextFormula = calcFormula.slice(0, -1);
        setCalcFormula(nextFormula);
        try {
          if (nextFormula && !isNaN(Number(nextFormula.slice(-1)))) {
            const sanitized = nextFormula.replace(/×/g, "*").replace(/÷/g, "/");
            const result = Function(`"use strict"; return (${sanitized})`)();
            if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
              setCalcDisplay(String(result));
            }
          } else if (!nextFormula) {
            setCalcDisplay("0");
          }
        } catch (e) {}
      } else {
        setCalcDisplay("0");
      }
    } else if (key === "=") {
      try {
        const sanitized = calcFormula.replace(/×/g, "*").replace(/÷/g, "/");
        if (!sanitized) return;
        const result = Function(`"use strict"; return (${sanitized})`)();
        if (typeof result === "number" && !isNaN(result)) {
          setCalcDisplay(String(result));
          setCalcHistory(prev => [`${calcFormula} = ${result}`, ...prev.slice(0, 4)]);
          setCalcFormula(String(result));
        } else {
          setCalcDisplay("Error");
        }
      } catch (e) {
        setCalcDisplay("Error");
      }
    } else if (key === "TAX" || key === "VAT" || key === "INT") {
      let rate = 0;
      let label = "";
      if (key === "TAX") { rate = 0.21; label = "Corp Tax (21%)"; }
      if (key === "VAT") { rate = 0.15; label = "VAT (15%)"; }
      if (key === "INT") { rate = 0.05; label = "Interest (5%)"; }
      
      const currentVal = parseFloat(calcDisplay);
      if (!isNaN(currentVal)) {
        const calcVal = currentVal * rate;
        const rounded = parseFloat(calcVal.toFixed(2));
        setCalcDisplay(String(rounded));
        setCalcFormula(`${currentVal} × ${rate}`);
        addSysLog(`Calculator preset applied: ${label} calculation on \$${currentVal}`);
      }
    } else {
      let updatedFormula = calcFormula;
      if (calcFormula === "0" && !isNaN(Number(key))) {
        updatedFormula = key;
      } else {
        updatedFormula = calcFormula + key;
      }
      setCalcFormula(updatedFormula);
      try {
        if (!isNaN(Number(key)) || key === ".") {
          const sanitized = updatedFormula.replace(/×/g, "*").replace(/÷/g, "/");
          const result = Function(`"use strict"; return (${sanitized})`)();
          if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
            setCalcDisplay(String(result));
          }
        }
      } catch (e) {}
    }
  };

  const handleDepositCalculation = () => {
    const amount = parseFloat(calcDisplay);
    if (isNaN(amount) || amount <= 0) {
      addSysLog("Calculator deposit aborted: Invalid positive amount");
      return;
    }
    if (amount > 100000) {
      addSysLog("Calculator deposit aborted: Exceeds safe workspace audit cap (\$100,000)");
      return;
    }

    setCurrentUser(prev => ({ ...prev, balance: prev.balance + amount }));
    
    const newTx: Transaction = {
      id: `tx-calc-${Date.now()}`,
      title: `Calculator Ledger Credit`,
      amount: amount,
      status: "SUCCESS",
      date: new Date().toISOString(),
      category: "Deposit"
    };
    setEmulatorTransactions(prev => [newTx, ...prev]);
    addSysLog(`Ledger smart deposit: Credit \$${amount.toFixed(2)} generated via active calculator`);
  };

  // --- PHONE APPS HANDLERS: NOTES ---
  const handleCreateNote = (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote = {
      id: `nt-${Date.now()}`,
      title: newNoteTitle,
      category: newNoteCategory,
      content: newNoteContent || "No additional content written.",
      date: new Date().toISOString().split("T")[0]
    };

    setNotes(prev => [newNote, ...prev]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowCreateNote(false);
    setActiveNoteId(newNote.id);
    addSysLog(`Notes directory appended: Established new secure notepad titled "${newNote.title}"`);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
    }
    addSysLog(`Notes vault removed notepad entry: ${noteId}`);
  };

  // --- API PLAYGROUND STATE ---
  const [playgroundSelectedApi, setPlaygroundSelectedApi] = useState<any>(MOCK_API_ENDPOINTS[0]);
  const [playgroundRequestBody, setPlaygroundRequestBody] = useState<string>(MOCK_API_ENDPOINTS[0].bodyTemplate || "");
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("");
  const [playgroundLoading, setPlaygroundLoading] = useState<boolean>(false);
  const [playgroundHeaders, setPlaygroundHeaders] = useState<string>("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nContent-Type: application/json");

  // --- CODE BLOCK STATE ---
  const [selectedCodeCategory, setSelectedCodeCategory] = useState<"frontend" | "backend" | "config">("frontend");
  const [selectedCodeFile, setSelectedCodeFile] = useState<CodeBlock>(CODE_BLOCKS[4]); // auth_bloc.dart

  // --- BACKEND ANALYTICS STATE ---
  const [dashboardStats, setDashboardStats] = useState<any>({
    activeUsers24h: 18450,
    apiSuccessRate: "99.94%",
    redisCacheHitRate: "89.4%",
    averageLatencyMs: 42,
    activeSupportTickets: 3
  });

  // --- TIMERS / LIVE STATUS ---
  const [serverStatus, setServerStatus] = useState<"online" | "syncing" | "offline">("online");
  const [sysLog, setSysLog] = useState<string[]>([]);

  // Auto-scroll chat window
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initial load
  useEffect(() => {
    fetchTransactions(1, true);
    fetchMapLocations();
    fetchAnalyticsStats();
    addSysLog("Aura Mobile Microservices Workspace initialized");
    addSysLog("Spring Boot Security Filter mounted successfully");
    addSysLog("Redis client linked with 1540 keys cached");
  }, []);

  // Update playground body template when endpoint changes
  const selectApiInPlayground = (api: any) => {
    setPlaygroundSelectedApi(api);
    setPlaygroundRequestBody(api.bodyTemplate || "");
    setPlaygroundResponse("");
  };

  const addSysLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSysLog(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
    addSysLog(`Copied code blueprint: ${label}`);
  };

  // --- ENDPOINT FETCH IMPLEMENTATIONS ---

  const fetchTransactions = async (page: number, replace = false) => {
    setTxLoading(true);
    try {
      // Direct REST Call
      const res = await fetch(`/api/v1/transactions?page=${page}&limit=4`, {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTk4NDMiLCJuYW1lIjoiQWxleGFuZGVyIiwiZXhwIjoyNTcxNDUzNjAwfQ..."
        }
      });
      const data = await res.json();
      if (data.success) {
        if (replace) {
          setEmulatorTransactions(data.transactions);
        } else {
          setEmulatorTransactions(prev => [...prev, ...data.transactions]);
        }
        setHasMoreTransactions(data.hasMore);
        setCurrentPage(page);
      }
    } catch (e: any) {
      console.error(e);
      addSysLog(`Error calling transaction logs: ${e.message}`);
    } finally {
      setTxLoading(false);
    }
  };

  const handlePullToRefresh = async () => {
    setPullingRefresh(true);
    addSysLog("Client issued Pull-To-Refresh on dashboard view");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchTransactions(1, true);
    setPullingRefresh(false);
    addSysLog("Dashboard cache refreshed successfully");
  };

  const handleLoadMoreTransactions = () => {
    if (hasMoreTransactions && !txLoading) {
      addSysLog(`Client requested ledger pagination. Page: ${currentPage + 1}`);
      fetchTransactions(currentPage + 1, false);
    }
  };

  const fetchMapLocations = async () => {
    try {
      const res = await fetch("/api/v1/locations");
      const data = await res.json();
      if (data.success) {
        setMapNodes(data.locations);
        setSelectedMapNode(data.locations[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalyticsStats = async () => {
    try {
      const res = await fetch("/api/v1/analytics/dashboard");
      const data = await res.json();
      if (data.success) {
        setDashboardStats(data.summary);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Login execution
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setLoginError("Corporate Email and Password are required");
      return;
    }
    if (passwordInput.length < 8) {
      setLoginError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);
    addSysLog(`Client requested JWT login for ${emailInput}`);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        addSysLog(`REST login successful. Signed JWT issued.`);
        setCurrentUser(resData.user);
        // Prompt for OTP
        setCurrentScreen(EmulatorScreen.OTP);
      } else {
        setLoginError(resData.error || "Authentication failed");
      }
    } catch (err: any) {
      setLoginError("Connection refused by auth gateway server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Biometric bypass
  const handleBiometricLogin = async () => {
    setBiometricScanning(true);
    addSysLog("Initiating Biometric Handshake: Authenticating asymmetric hardware keys");
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await fetch("/api/v1/auth/biometric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ biometricKey: "pub_aura_device_signature_98df89ca8f" })
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setCurrentScreen(EmulatorScreen.DASHBOARD);
        addSysLog("Biometric secure signature authenticated. Bypassed credentials.");
      }
    } catch (e) {
      addSysLog("Biometric key match failed.");
    } finally {
      setBiometricScanning(false);
    }
  };

  // OTP Validation
  const handleOtpValueChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // Only numeric digit
    const newOtp = [...otpInput];
    newOtp[index] = val.slice(-1);
    setOtpInput(newOtp);

    // Auto focus next
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const submitOtpCode = async () => {
    const fullCode = otpInput.join("");
    if (fullCode.length < 6) {
      setOtpError("Must enter full 6-digit corporate verification code");
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);
    addSysLog(`OTP validation request: ${fullCode}`);

    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, code: fullCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setCurrentScreen(EmulatorScreen.DASHBOARD);
        addSysLog("OTP validated successfully. Standard authorization context loaded.");
      } else {
        setOtpError(data.error || "Verification failed");
      }
    } catch (e) {
      setOtpError("Failed to verify code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chat Submission (REST / Gemini)
  const submitChatMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    const newMsg: ChatMessage = {
      id: "m-" + Date.now(),
      sender: "user",
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatLoading(true);
    addSysLog(`Chat support payload sent: "${userMsg.slice(0, 30)}..."`);

    try {
      const response = await fetch("/api/v1/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      const resData = await response.json();
      if (resData.success) {
        setChatMessages(prev => [...prev, {
          id: "m-reply-" + Date.now(),
          sender: "bot",
          text: resData.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error(err);
      addSysLog("Error sending message to support socket");
    } finally {
      setChatLoading(false);
    }
  };

  // Sandbox Payment execution
  const executeSandboxCharge = async () => {
    if (!chargeAmount || parseFloat(chargeAmount) <= 0) return;
    setIsSubmitting(true);
    setPaymentSuccess(null);
    addSysLog(`Issuing secure payment intent. Amount: \$${chargeAmount} via ${paymentMethod}`);

    try {
      const response = await fetch("/api/v1/payments/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        body: JSON.stringify({
          amount: chargeAmount,
          currency: "USD",
          paymentMethod: paymentMethod,
          email: currentUser.email
        })
      });
      const data = await response.json();
      if (data.success) {
        setPaymentSuccess(`Successfully charged \$${chargeAmount}! Ref: ${data.transactionId}`);
        // Deduct balance locally
        setCurrentUser(prev => ({ ...prev, balance: prev.balance - parseFloat(chargeAmount) }));
        fetchTransactions(1, true);
        addSysLog(`Ledger updated. Client balance: \$${(currentUser.balance - parseFloat(chargeAmount)).toFixed(2)}`);
      }
    } catch (e) {
      addSysLog("Failed to process charge on payment gateway.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // API Playground REST test execution
  const executePlaygroundTest = async () => {
    setPlaygroundLoading(true);
    addSysLog(`API Playground executing manual REST lookup: ${playgroundSelectedApi.method} ${playgroundSelectedApi.path}`);

    try {
      let response;
      if (playgroundSelectedApi.method === "POST") {
        let parsedBody;
        try {
          parsedBody = JSON.parse(playgroundRequestBody);
        } catch (e) {
          parsedBody = {};
        }

        response = await fetch(playgroundSelectedApi.path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          },
          body: JSON.stringify(parsedBody)
        });
      } else {
        response = await fetch(playgroundSelectedApi.path, {
          headers: {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
        });
      }

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        setPlaygroundResponse(JSON.stringify(json, null, 2));
      } catch (e) {
        setPlaygroundResponse(text);
      }
      addSysLog(`Response code received: ${response.status} ${response.statusText}`);
    } catch (err: any) {
      setPlaygroundResponse(`Error fetching endpoint:\n${err.message}`);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Filter local transaction records in emulator UI
  const filteredTransactions = emulatorTransactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || tx.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen font-sans bg-[#040612] text-slate-100 selection:bg-cyan-500 selection:text-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-x-hidden">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
      
      {/* Interactive App Brand Banner */}
      <div className="mb-6 text-center z-10 select-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-full text-[10px] text-cyan-400 font-mono tracking-wider mb-2.5 shadow-md backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          AURA SECURE SYSTEM ONLINE
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white font-display uppercase sm:text-3xl">Aura Mobile Space</h1>
        <p className="text-xs text-slate-400 max-w-[320px] mx-auto mt-1 leading-relaxed">
          High-fidelity smart card & enterprise secure ledger simulation environment.
        </p>
      </div>

      {false && (
      <header className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-xl shadow-lg shadow-cyan-900/20 text-slate-950 animate-pulse">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight text-lg font-display">AURA ARCHITECT STUDIO</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Enterprise v4.1</span>
            </div>
            <p className="text-xs text-slate-400">Mobile Development Console & High-Fidelity Simulator</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Microservice Ping */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SPRING PORT: 3000
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-mono">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            REDIS: ACTIVE
          </div>

          <button 
            onClick={() => {
              // Trigger manual refresh simulation
              setServerStatus("syncing");
              addSysLog("Instructed microservices to sync caches.");
              setTimeout(() => {
                setServerStatus("online");
                fetchAnalyticsStats();
                addSysLog("Sync completed. All ledger records congruent.");
              }, 1200);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Sync Database & Clean Redis"
          >
            <RefreshCw className={`w-4 h-4 ${serverStatus === "syncing" ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </header>
      )}

      {/* WORKSPACE NAVIGATION TABS */}
      {false && (
      <nav className="bg-[#0b0f19] border-b border-slate-800 px-6 py-2 flex items-center overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab(WorkspaceTab.OVERVIEW)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === WorkspaceTab.OVERVIEW 
              ? "bg-slate-800 text-white shadow-inner font-semibold border border-slate-700/80" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
          id="tab-overview"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Stack Overview
        </button>

        <button
          onClick={() => setActiveTab(WorkspaceTab.EMULATOR)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === WorkspaceTab.EMULATOR 
              ? "bg-slate-800 text-white shadow-inner font-semibold border border-slate-700/80" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
          id="tab-emulator"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          Interactive Emulator
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        </button>

        <button
          onClick={() => setActiveTab(WorkspaceTab.ARCHITECTURE)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === WorkspaceTab.ARCHITECTURE 
              ? "bg-slate-800 text-white shadow-inner font-semibold border border-slate-700/80" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
          id="tab-architecture"
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          Clean Architecture Mappings
        </button>

        <button
          onClick={() => setActiveTab(WorkspaceTab.API_PLAYGROUND)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === WorkspaceTab.API_PLAYGROUND 
              ? "bg-slate-800 text-white shadow-inner font-semibold border border-slate-700/80" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
          id="tab-api"
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          REST API Playground
        </button>

        <button
          onClick={() => setActiveTab(WorkspaceTab.DB_SCHEMA)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === WorkspaceTab.DB_SCHEMA 
              ? "bg-slate-800 text-white shadow-inner font-semibold border border-slate-700/80" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
          id="tab-schema"
        >
          <Database className="w-4 h-4 text-violet-400" />
          MySQL & Redis Caches
        </button>

        <button
          onClick={() => setActiveTab(WorkspaceTab.CODE_GENERATOR)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === WorkspaceTab.CODE_GENERATOR 
              ? "bg-slate-800 text-white shadow-inner font-semibold border border-slate-700/80" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
          id="tab-code"
        >
          <Code2 className="w-4 h-4 text-sky-400" />
          Production Code Center
        </button>

        <button
          onClick={() => setActiveTab(WorkspaceTab.DEVOPS)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === WorkspaceTab.DEVOPS 
              ? "bg-slate-800 text-white shadow-inner font-semibold border border-slate-700/80" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
          id="tab-devops"
        >
          <Shield className="w-4 h-4 text-rose-400" />
          Docker & DevOps Build
        </button>
      </nav>
      )}

      {/* CORE CONTENT LAYOUT */}
      <main className="flex-1 flex items-center justify-center py-6 w-full max-w-3xl mx-auto z-10">
        
        {/* LEFT/MAIN WORKSPACE BLOCK: Takes 8 cols on desktop */}
        {false && (
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* TAB 1: STACK OVERVIEW */}
          {activeTab === WorkspaceTab.OVERVIEW && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 transition-all duration-300">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold tracking-wider text-xs uppercase font-display">Technical Portfolio</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white font-display">Aura Architecture Blueprint</h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Welcome to Aura, an enterprise-grade mobile wallet and workspace built strictly on high-performance frameworks. 
                  Below are the engineering blocks of our frontend and backend microservice structure.
                </p>
              </div>

              {/* Bento Grid Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                    <h3 className="font-bold text-white text-sm">Flutter / React Native Presentation</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Designed using beautiful Material Design 3 guidelines. Integrates structured BLoC state management to handle login forms, biometrics, offline synchronized data caching, and seamless list pagination.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Server className="w-5 h-5" />
                    <h3 className="font-bold text-white text-sm">Spring Boot 3 REST API Backend</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Engineered with Spring Security 6 implementing stateless JWT verification filters, symmetric key cryptographic checks, Hibernate ORM mappings, dynamic analytics pipelines, and secure payment integrations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-violet-400">
                    <Database className="w-5 h-5" />
                    <h3 className="font-bold text-white text-sm">Relational Schemas & Cache</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Optimized MySQL 8 database layout storing core user records, asymmetric biometric certificates, and ledger statements. Features high-speed Redis memory caching to speed up query response latencies to &lt; 40ms.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-bold text-white text-sm">Enterprise Security Matrix</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Protects resources via biometric authorization mechanisms, cryptographic token expirations, secure CORS restrictions, BCrypt password hashing, and Docker virtualization isolated networks.
                  </p>
                </div>
              </div>

              {/* Stack Visual Pipeline */}
              <div className="bg-[#0c101b] border border-slate-800/80 rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">End-to-End Enterprise Flow</h3>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 w-full bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold block">Client</span>
                    <span className="text-xs text-white font-bold block mt-1">Flutter UI / BLoC</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">JWT Token Storage</span>
                  </div>

                  <div className="text-slate-600 font-bold hidden md:block">➔</div>

                  <div className="flex-1 w-full bg-slate-900 p-3 rounded-lg border border-indigo-900/30 text-center">
                    <span className="text-[10px] uppercase font-mono text-indigo-400 font-semibold block">Secure Gateway</span>
                    <span className="text-xs text-white font-bold block mt-1">Spring Security 6</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">JwtFilter intercept</span>
                  </div>

                  <div className="text-slate-600 font-bold hidden md:block">➔</div>

                  <div className="flex-1 w-full bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-violet-400 font-semibold block">In-Memory Store</span>
                    <span className="text-xs text-white font-bold block mt-1">Redis Database</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Cache hit-rate: 89.4%</span>
                  </div>

                  <div className="text-slate-600 font-bold hidden md:block">➔</div>

                  <div className="flex-1 w-full bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold block">Persistent DB</span>
                    <span className="text-xs text-white font-bold block mt-1">MySQL Engine</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">InnoDB Ledger Records</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Guide */}
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Experience it live!</h4>
                    <p className="text-[11px] text-slate-400">Open the emulator or query playground using the workspace buttons</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab(WorkspaceTab.EMULATOR)}
                  className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors"
                >
                  Launch Emulator
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE EMULATOR EXPLANATION */}
          {activeTab === WorkspaceTab.EMULATOR && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Live Mobile Emulator Sandbox</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Use the smartphone frame to trigger genuine REST network interactions.</p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono font-semibold text-emerald-400">
                  REAL-TIME API CONNECTED
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-slate-300 mb-1">Authenticating & Bypass</h4>
                  <p className="leading-relaxed">
                    Test the system by filling the corporate email (<code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">alex@aura-studio.com</code>) and clicking Sign In. Or hit the <strong className="text-white">FaceID</strong> scanner to see immediate asymmetric cryptographic bypass and token handshakes!
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-slate-300 mb-1">Interact & Chat (Gemini powered)</h4>
                  <p className="leading-relaxed">
                    Once inside, slide the pull handle down on the Ledger to trigger a live cache clear. Send actual queries to the Help Desk Chat – powered by server-side Gemini models – regarding JWTs, Redis layers, or BLoCs!
                  </p>
                </div>
              </div>

              {/* Instructions on Emulator Keys */}
              <div className="bg-[#0c101b] rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Demo User Credentials Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-mono">CORPORATE EMAIL</span>
                    <span className="font-bold text-white text-xs mt-0.5">alex@aura-studio.com</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-mono">DEMO PASSWORD</span>
                    <span className="font-bold text-white text-xs mt-0.5">AuraPass2026!</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-mono">OTP BYPASS CODE</span>
                    <span className="font-bold text-white text-xs mt-0.5">123456 / 999999</span>
                  </div>
                </div>
              </div>

              {/* Sync diagnostic stats with emulator */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap gap-4 justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-slate-300 font-bold">Ledger Balance:</span>
                  <span className="text-white font-mono font-bold">${currentUser.balance.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Current Screen Context:</span>
                  <span className="text-cyan-400 uppercase font-mono font-bold px-2 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/20">{currentScreen}</span>
                </div>
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    setCurrentScreen(EmulatorScreen.LOGIN);
                    setOtpInput(["", "", "", "", "", ""]);
                    addSysLog("Client requested session invalidation (Logout)");
                  }}
                  className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
                >
                  Reset Session
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CLEAN ARCHITECTURE MAPS */}
          {activeTab === WorkspaceTab.ARCHITECTURE && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Clean Architecture Layers & Data Flow</h2>
                <p className="text-xs text-slate-400 mt-1">We enforce standard corporate boundaries separating views, logic, repositories, and caches.</p>
              </div>

              {/* Flutter Clean MVVM Architecture */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Frontend Layer Breakdown (Flutter / React Native with BLoC)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-emerald-900/30 rounded-xl p-4 flex flex-col gap-2">
                    <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded self-start">Presentation Layer</span>
                    <h4 className="text-xs font-bold text-white mt-1">Screens, Styles & State Views</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Material Design 3 Screens (<code className="text-emerald-400 text-[10px]">login_screen.dart</code>) that capture interactions, validate user input locally, and draw layout skeletons. Sends trigger actions as events to the BLoC manager.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-cyan-900/30 rounded-xl p-4 flex flex-col gap-2">
                    <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold rounded self-start">Domain Layer</span>
                    <h4 className="text-xs font-bold text-white mt-1">Core Models, Entities & Use Cases</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Holds the absolute business rules (<code className="text-cyan-400 text-[10px]">user_model.dart</code>, <code className="text-cyan-400 text-[10px]">transaction_model.dart</code>) separate from UI components. Defines contract interfaces for API repositories.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-indigo-900/30 rounded-xl p-4 flex flex-col gap-2">
                    <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold rounded self-start">Data Layer</span>
                    <h4 className="text-xs font-bold text-white mt-1">REST Clients & Secure Storage</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Executes network calls using Dio/Http clients, appends JWT authorization headers securely, handles cache failures, and stores verified credentials in Local Secure Storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Spring Boot 3 Layer Breakdown */}
              <div className="flex flex-col gap-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Spring Boot 3 + Spring Security Layers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">1. CONTROLLER</span>
                    <h5 className="text-xs font-bold text-white">REST Entry Controller</h5>
                    <p className="text-[11px] text-slate-400">Maps incoming requests and validates input parameters before launching service methods.</p>
                  </div>

                  <div className="bg-slate-900 border border-indigo-900/40 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">2. SECURITY</span>
                    <h5 className="text-xs font-bold text-white">JWT Security Filter</h5>
                    <p className="text-[11px] text-slate-400">Intercepts headers, verifies cryptographic key validity, and loads authorization scopes.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-violet-400 font-bold uppercase">3. SERVICE</span>
                    <h5 className="text-xs font-bold text-white">Business Logic Service</h5>
                    <p className="text-[11px] text-slate-400">Applies operational workflows, coordinates Stripe payments, and registers cache rules.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">4. REPOSITORY</span>
                    <h5 className="text-xs font-bold text-white">Spring Data JPA / ORM</h5>
                    <p className="text-[11px] text-slate-400">Queries database tables via Hibernate, executing high-speed transactional inserts.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API PLAYGROUND */}
          {activeTab === WorkspaceTab.API_PLAYGROUND && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Aura REST API playground</h2>
                <p className="text-xs text-slate-400 mt-1">Dispatch actual REST requests directly into our backend server to inspect response headers, models, and payloads.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Side: Route selection */}
                <div className="md:col-span-5 flex flex-col gap-2.5">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Available Endpoints</h3>
                  {MOCK_API_ENDPOINTS.map((api, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectApiInPlayground(api)}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        playgroundSelectedApi.path === api.path 
                          ? "bg-slate-800/80 border-slate-700 text-white shadow-md" 
                          : "bg-slate-900/65 border-slate-800/60 text-slate-300 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                          api.method === "POST" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}>
                          {api.method}
                        </span>
                        <span className="font-mono text-xs font-semibold select-all">{api.path}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{api.description}</p>
                    </button>
                  ))}
                </div>

                {/* Right Side: Execution and Response */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  
                  {/* Request Parameters Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">REST Headers</span>
                      {playgroundSelectedApi.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/25 px-1.5 py-0.5 rounded">
                          <Lock className="w-3 h-3" />
                          JWT REQUIRED
                        </span>
                      )}
                    </div>
                    
                    <textarea
                      value={playgroundHeaders}
                      onChange={(e) => setPlaygroundHeaders(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/40 resize-none"
                    />

                    {playgroundSelectedApi.method === "POST" && (
                      <>
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mt-1">JSON Request Body Payload</span>
                        <textarea
                          value={playgroundRequestBody}
                          onChange={(e) => setPlaygroundRequestBody(e.target.value)}
                          rows={4}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </>
                    )}

                    <button
                      onClick={executePlaygroundTest}
                      disabled={playgroundLoading}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {playgroundLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Executing REST Request...
                        </>
                      ) : (
                        <>
                          <Terminal className="w-4 h-4 text-slate-950" />
                          Send REST Call & Execute
                        </>
                      )}
                    </button>
                  </div>

                  {/* Response Container */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">JSON Server Response</span>
                    <pre className="max-h-[220px] overflow-y-auto bg-slate-900 border border-slate-950 rounded p-3 text-xs font-mono text-emerald-400 leading-relaxed scrollbar-thin select-all">
                      {playgroundResponse ? playgroundResponse : "// Hit 'Send REST Call & Execute' to inspect server response payload"}
                    </pre>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: DATABASE SCHEMA & REDIS */}
          {activeTab === WorkspaceTab.DB_SCHEMA && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Database Schema & Caching Visualizer</h2>
                  <p className="text-xs text-slate-400 mt-1">Highly scalable MySQL schema optimized with index layouts, accompanied by a dynamic Redis Cache model.</p>
                </div>
                <button
                  onClick={() => handleCopy(SQL_SCHEMA, "MySQL Schema")}
                  className="flex items-center gap-1.5 self-start px-3 py-1.5 bg-slate-800 text-xs font-bold text-white rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedText === "MySQL Schema" ? "Copied!" : "Copy Full SQL Script"}
                </button>
              </div>

              {/* Cache Layer Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-indigo-900/30 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Database className="w-5 h-5" />
                    <h4 className="font-bold text-white text-xs">MySQL 8 InnoDB Engine</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Handles persistent ledger accounts, system security logs, and user credentials. Features foreign key cascades and targeted indexing algorithms on lookup columns (<code className="text-emerald-400 text-[10px]">idx_email</code>).
                  </p>
                </div>

                <div className="bg-slate-900 border border-violet-900/30 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-violet-400">
                    <Layers className="w-5 h-5" />
                    <h4 className="font-bold text-white text-xs">Redis Cache Layer</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Saves fast-changing or costly database search results. Implements standard Cache-Aside pattern manually via Spring's <code className="text-violet-400 text-[10px]">RedisTemplate</code>, guaranteeing latency times &lt; 3ms.
                  </p>
                </div>

                <div className="bg-slate-900 border border-rose-900/30 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Shield className="w-5 h-5" />
                    <h4 className="font-bold text-white text-xs">Cryptographic Integrity</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Passwords are never stored in plain text. Uses Spring Security's <code className="text-rose-400 text-[10px]">BCryptPasswordEncoder</code> with a high workload strength of 12 rounds to avoid dictionary attacks.
                  </p>
                </div>
              </div>

              {/* Schema SQL file view */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Production MySQL Schema Code Script</span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                  <pre className="text-[11px] font-mono text-cyan-300 leading-relaxed select-all">
                    {SQL_SCHEMA}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRODUCTION CODE CENTER */}
          {activeTab === WorkspaceTab.CODE_GENERATOR && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Aura Production Code Repository</h2>
                  <p className="text-xs text-slate-400 mt-1">Browse, inspect, and copy standard clean architecture blueprint files across frontend and backend layers.</p>
                </div>
                <button
                  onClick={() => handleCopy(selectedCodeFile.code, selectedCodeFile.fileName)}
                  className="flex items-center gap-1.5 self-start px-3.5 py-2 bg-slate-800 text-xs font-bold text-white rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copiedText === selectedCodeFile.fileName ? "Copied!" : "Copy Active File"}
                </button>
              </div>

              {/* Code Selection Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => {
                    setSelectedCodeCategory("frontend");
                    // Select first frontend block
                    const first = CODE_BLOCKS.find(b => b.category === "frontend");
                    if (first) setSelectedCodeFile(first);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all uppercase ${
                    selectedCodeCategory === "frontend" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  FLUTTER FRONTEND
                </button>
                <button
                  onClick={() => {
                    setSelectedCodeCategory("backend");
                    const first = CODE_BLOCKS.find(b => b.category === "backend");
                    if (first) setSelectedCodeFile(first);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all uppercase ${
                    selectedCodeCategory === "backend" 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  SPRING BOOT 3 BACKEND
                </button>
                <button
                  onClick={() => {
                    setSelectedCodeCategory("config");
                    const first = CODE_BLOCKS.find(b => b.category === "config");
                    if (first) setSelectedCodeFile(first);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all uppercase ${
                    selectedCodeCategory === "config" 
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  DOCKER ORCHESTRATION
                </button>
              </div>

              {/* Horizontal List of files in the selected category */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {CODE_BLOCKS.filter(b => b.category === selectedCodeCategory).map((block, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCodeFile(block)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      selectedCodeFile.fileName === block.fileName 
                        ? "bg-slate-800 border-slate-700 shadow-md" 
                        : "bg-slate-900 border-slate-800/60 hover:bg-slate-850"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 font-bold block truncate">{block.fileName}</span>
                    <span className="text-[11px] text-white font-bold block truncate">{block.title}</span>
                  </button>
                ))}
              </div>

              {/* Code Display Area */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    <span className="text-xs font-mono text-slate-200 font-semibold">{selectedCodeFile.fileName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{selectedCodeFile.language}</span>
                </div>
                <p className="text-xs text-slate-400 italic mb-2">{selectedCodeFile.description}</p>
                <div className="max-h-[350px] overflow-y-auto rounded bg-slate-900/60 p-3 border border-slate-900 scrollbar-thin select-all">
                  <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                    {selectedCodeFile.code}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DEVOPS & DEPLOYMENT */}
          {activeTab === WorkspaceTab.DEVOPS && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-white font-display">DevOps Orchestration & Deployment Manual</h2>
                <p className="text-xs text-slate-400 mt-1">Guidelines for staging Docker builds, optimizing Redis caches, and testing the microservice environment.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Deployment Commands */}
                <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Production Launch Sequence</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Compile backend assets and launch the multi-container isolated workspace under Docker Compose:</p>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span># 1. Compile Spring Boot Jar</span>
                      <button onClick={() => handleCopy("./mvnw clean package -DskipTests", "mvnw")} className="text-cyan-400 hover:text-cyan-300">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-300 bg-slate-950 p-2 rounded">
                      $ ./mvnw clean package -DskipTests
                    </pre>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span># 2. Spin Up Containers</span>
                      <button onClick={() => handleCopy("docker-compose up -d --build", "docker compose")} className="text-cyan-400 hover:text-cyan-300">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-300 bg-slate-950 p-2 rounded">
                      $ docker-compose up -d --build
                    </pre>
                  </div>
                </div>

                {/* Best Practices Checklist */}
                <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Security & Performance Hardening</h3>
                  <ul className="text-xs text-slate-300 flex flex-col gap-3">
                    <li className="flex gap-2.5 items-start">
                      <CheckCircle className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Stateless JWT Validation:</strong> Ensure tokens expire in &lt; 24h and require asymmetric signatures.
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <CheckCircle className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Redis Cache-Aside Pattern:</strong> Force dynamic eviction triggers whenever User entities updates to ensure synchronization.
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <CheckCircle className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Biometric Encryption:</strong> Stores symmetric credentials within native keychains (Keychain / Keystore).
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <CheckCircle className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Spring Actuator Monitoring:</strong> Bind diagnostic endpoints to a separate local firewall port for security.
                      </div>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* BACKEND SHELL/CONSOLE SIMULATION FOOTER */}
          <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Workspace Microservice Logs
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Streaming</span>
            </div>
            
            <div className="max-h-[120px] overflow-y-auto bg-slate-950 rounded-lg p-3 text-slate-300 font-mono text-[11px] leading-relaxed flex flex-col gap-1.5 scrollbar-thin">
              {sysLog.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-cyan-500 shrink-0">➔</span>
                  <span className="whitespace-pre-wrap">{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
        )}

        {/* CENTERED SMARTPHONE preview CONTAINER */}
        <div className="flex justify-center w-full z-10">
          
          {/* HIGH FIDELITY SMARTPHONE FRAME */}
          <div className="relative w-full max-w-[340px] h-[670px] rounded-[50px] border-[12px] border-slate-850 bg-slate-950 p-3 shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-800">
            
            {/* Camera Dynamic Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-950 rounded-full z-50 flex items-center justify-center gap-1.5 px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-850 border border-slate-900"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-950"></div>
            </div>

            {/* Simulated Status Bar */}
            <div className="h-7 px-5 pt-1.5 flex items-center justify-between text-[11px] text-white/90 z-40 relative">
              <span className="font-bold font-mono">23:28</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px]">5G</span>
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* SCREEN CANVAS AREA (Simulates App UI) */}
            <div className="flex-1 rounded-[38px] bg-[#0c0e17] overflow-hidden flex flex-col relative border border-slate-900">
              
              {/* --- SCREEN 1: LOGIN SCREEN --- */}
              {currentScreen === EmulatorScreen.LOGIN && (
                <div className="flex-1 flex flex-col p-5 justify-between animate-fade-in text-slate-100">
                  <div className="flex flex-col items-center text-center mt-6">
                    <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl shadow-lg text-slate-950 animate-bounce">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight mt-3 font-display">Aura Workspace</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Enterprise Mobile Security System</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                    {loginError && (
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Corporate Email</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="alex@aura-studio.com"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Security Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs w-full focus:outline-none focus:border-cyan-500 text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-xl text-xs mt-2 transition-colors cursor-pointer"
                    >
                      {isSubmitting ? "Authenticating..." : "Sign In Securely"}
                    </button>
                  </form>

                  {/* Biometric Scan Trigger and social icons */}
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Secure Biometric Bypass</span>
                    
                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      disabled={biometricScanning}
                      className="p-3.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-slate-850 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer"
                      title="Simulate FaceID Scan"
                    >
                      {biometricScanning ? (
                        <>
                          <div className="absolute inset-0 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                          <Shield className="w-6 h-6 animate-pulse text-indigo-400" />
                        </>
                      ) : (
                        <KeyRound className="w-6 h-6" />
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400">Click FaceID icon to bypass credential form</span>
                  </div>
                </div>
              )}

              {/* --- SCREEN 2: OTP VERIFICATION --- */}
              {currentScreen === EmulatorScreen.OTP && (
                <div className="flex-1 flex flex-col p-5 justify-between animate-fade-in text-slate-100">
                  <div className="flex flex-col items-center text-center mt-6">
                    <div className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/20 text-cyan-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-md font-bold text-white mt-3 font-display">OTP Code Verification</h3>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">A 6-digit corporate verification code was sent to your inbox.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {otpError && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 text-center rounded">
                        {otpError}
                      </div>
                    )}

                    {/* Code Inputs */}
                    <div className="flex justify-between gap-1.5 px-2">
                      {otpInput.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpValueChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-md font-bold text-white focus:outline-none focus:border-cyan-500"
                        />
                      ))}
                    </div>

                    <button
                      onClick={submitOtpCode}
                      disabled={isSubmitting}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      {isSubmitting ? "Validating..." : "Confirm Verification"}
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-slate-400">By-pass code is: <code className="text-cyan-400">123456</code></span>
                    <button
                      onClick={() => {
                        setCurrentScreen(EmulatorScreen.LOGIN);
                        setOtpError(null);
                      }}
                      className="text-[10px] font-mono text-slate-500 hover:text-white"
                    >
                      ➔ Cancel & Back
                    </button>
                  </div>
                </div>
              )}

              {/* --- SCREEN 3: BENTO DASHBOARD --- */}
              {currentScreen === EmulatorScreen.DASHBOARD && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  
                  {/* Small app header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center">
                        <span className="text-slate-950 text-xs font-black">A</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Aura Space</h4>
                        <span className="text-[9px] text-slate-400">Tier: {currentUser.tier}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.SETTINGS)}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-white text-slate-400"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dashboard Content with pull refresh simulation */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 scrollbar-none">
                    
                    {/* Pull-To-Refresh Simulation Handle */}
                    <div className="flex justify-center -mt-2">
                      <button
                        onClick={handlePullToRefresh}
                        className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 ${pullingRefresh ? "animate-spin" : ""}`} />
                        {pullingRefresh ? "Refreshing Cache..." : "Pull Down to Sync"}
                      </button>
                    </div>

                    {/* Main Balance Bento Card */}
                    <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl p-4 shadow-lg flex flex-col justify-between h-[110px] text-slate-950 shrink-0">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Active Corporate Ledger</span>
                        <span className="text-xl font-extrabold font-display tracking-tight">${currentUser.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono opacity-80">ID: {currentUser.id}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-bold">SECURE ACC</span>
                      </div>
                    </div>

                    {/* Action grid (8 apps bento-style) */}
                    <div className="grid grid-cols-4 gap-2 shrink-0">
                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.PAYMENT)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <CreditCard className="w-4 h-4 text-cyan-400" />
                        <span className="text-[9px] font-bold text-slate-200">Transfer</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.VAULTS)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <TrendingUp className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-200">Vaults</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.MAP)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-[9px] font-bold text-slate-200">Aura Map</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.CHAT)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span className="text-[9px] font-bold text-slate-200">Support</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.GALLERY)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <Image className="w-4 h-4 text-violet-400" />
                        <span className="text-[9px] font-bold text-slate-200">Gallery</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.CALCULATOR)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <Calculator className="w-4 h-4 text-rose-400" />
                        <span className="text-[9px] font-bold text-slate-200">Calculator</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.NOTES)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <FileText className="w-4 h-4 text-orange-400" />
                        <span className="text-[9px] font-bold text-slate-200">Notes</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(EmulatorScreen.SETTINGS)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 hover:bg-slate-850 hover:border-slate-700 transition-all"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-200">Settings</span>
                      </button>
                    </div>

                    {/* Transaction list search and filter header */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">Activity Ledger</h4>
                        <span className="text-[9px] font-mono text-slate-500">Live Cached</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="Search receipts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-500"
                        />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none"
                        >
                          <option value="All">All</option>
                          <option value="Subscription">Subscription</option>
                          <option value="Deposit">Deposit</option>
                          <option value="Billing">Billing</option>
                        </select>
                      </div>
                    </div>

                    {/* Paginated ledger records or skeletons */}
                    <div className="flex flex-col gap-2 flex-1">
                      {txLoading && emulatorTransactions.length === 0 ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between shimmer h-12"></div>
                        ))
                      ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-6 text-[10px] text-slate-500">No transactions match query filter parameters</div>
                      ) : (
                        filteredTransactions.map((tx, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${tx.amount < 0 ? "bg-red-400" : "bg-emerald-400"}`}></span>
                              <div>
                                <h5 className="font-bold text-white text-[11px] truncate max-w-[130px]">{tx.title}</h5>
                                <span className="text-[9px] text-slate-400">{tx.category}</span>
                              </div>
                            </div>
                            <span className={`font-mono text-[11px] font-bold ${tx.amount < 0 ? "text-slate-300" : "text-emerald-400"}`}>
                              {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}

                      {/* Infinite Scroll trigger button */}
                      {hasMoreTransactions && (
                        <button
                          onClick={handleLoadMoreTransactions}
                          className="w-full py-1.5 mt-1 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-white text-[10px] text-slate-400 text-center transition-colors shrink-0"
                        >
                          {txLoading ? "Loading ledger..." : "➔ Load Next Records (Page)"}
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-cyan-400">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500 hover:text-white">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500 hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500 hover:text-white">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* --- SCREEN 4: GPS WORKSPACE MAP --- */}
              {currentScreen === EmulatorScreen.MAP && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Aura Node Map
                    </span>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono"
                    >
                      ➔ Close
                    </button>
                  </div>

                  {/* Simulated GPS Map Canvas */}
                  <div className="flex-1 p-3 flex flex-col gap-3 relative">
                    <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between">
                      
                      {/* Stylized background lines mimicking road maps */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none">
                        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-cyan-500"></div>
                        <div className="absolute bottom-1/3 left-0 right-0 h-0.5 bg-cyan-500"></div>
                        <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-cyan-500"></div>
                        <div className="absolute top-0 bottom-0 right-1/4 w-0.5 bg-cyan-500"></div>
                      </div>

                      <div className="z-10 bg-slate-950/90 border border-slate-850 p-2 rounded-xl text-[10px]">
                        <span className="text-slate-400 font-mono block">SIMULATING MAP LOCATIONS</span>
                        <strong className="text-white mt-0.5 block">{selectedMapNode?.title}</strong>
                        <span className="text-slate-500 mt-0.5 block">{selectedMapNode?.description}</span>
                      </div>

                      {/* Map Pins */}
                      <div className="relative w-full h-[120px]">
                        <div 
                          onClick={() => setSelectedMapNode(mapNodes[0])}
                          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-full bg-emerald-500 border border-slate-950 hover:scale-110 transition-transform text-white"
                          title="Silicon Valley Office"
                        >
                          <MapPin className="w-4 h-4 text-white" />
                        </div>

                        <div 
                          onClick={() => setSelectedMapNode(mapNodes[1])}
                          className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-full bg-indigo-500 border border-slate-950 hover:scale-110 transition-transform text-white"
                          title="London Hub"
                        >
                          <MapPin className="w-4 h-4 text-white" />
                        </div>

                        <div 
                          onClick={() => setSelectedMapNode(mapNodes[2])}
                          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-full bg-violet-500 border border-slate-950 hover:scale-110 transition-transform text-white"
                          title="Tokyo Tech Hub"
                        >
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 z-10">
                        Click on pins to traverse corporate offices or regional nodes.
                      </div>

                    </div>

                    {/* Nodes Carousel */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {mapNodes.map((node, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedMapNode(node);
                            addSysLog(`Client selected node coordinates: ${node.title}`);
                          }}
                          className={`text-left p-2 rounded-lg border text-[10px] transition-all flex items-center justify-between ${
                            selectedMapNode?.id === node.id 
                              ? "bg-slate-800 border-slate-700 text-white" 
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}
                        >
                          <span>{node.title}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-cyan-400">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500 hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500 hover:text-white">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* --- SCREEN 5: AI SUPPORT CHAT (GEMINI) --- */}
              {currentScreen === EmulatorScreen.CHAT && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      Aura Help Desk
                    </span>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono"
                    >
                      ➔ Close
                    </button>
                  </div>

                  {/* Chat Message Lists */}
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 scrollbar-none">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
                      >
                        <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-indigo-500 text-white rounded-br-none" 
                            : "bg-slate-900 border border-slate-850 text-slate-200 rounded-bl-none"
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[8px] text-slate-500 mt-1 font-mono">{msg.timestamp}</span>
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="self-start flex flex-col gap-1">
                        <div className="bg-slate-900 border border-slate-850 rounded-xl p-2.5 rounded-bl-none flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef}></div>
                  </div>

                  {/* Message input */}
                  <form onSubmit={submitChatMessage} className="p-2.5 border-t border-slate-900 bg-[#090c15] flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Ask standard security / BLoC..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-cyan-400">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* --- SCREEN 6: PAYMENT GATEWAY (STRIPE) --- */}
              {currentScreen === EmulatorScreen.PAYMENT && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      Payment Terminal
                    </span>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono"
                    >
                      ➔ Close
                    </button>
                  </div>

                  <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-none">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Simulating Gateways</span>
                      <p className="text-[11px] text-slate-300">Interact with simulated Stripe endpoints to authorize a mock charge and deduct account ledger.</p>
                    </div>

                    {paymentSuccess && (
                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 flex flex-col gap-1 text-center">
                        <span className="font-bold">Transaction Success!</span>
                        <span className="text-[9px] break-all">{paymentSuccess}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                      >
                        <option value="Google Pay">Google Pay API</option>
                        <option value="Apple Pay">Apple Pay Integration</option>
                        <option value="Stripe Elements">Stripe Secured CC</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Charge Amount ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        placeholder="29.99"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <button
                      onClick={executeSandboxCharge}
                      disabled={isSubmitting}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      {isSubmitting ? "Deducting Balance..." : "Charge Live Account"}
                    </button>
                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* --- SCREEN 7: PROFILE INFO --- */}
              {currentScreen === EmulatorScreen.PROFILE && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white">Security Profile</span>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono"
                    >
                      ➔ Close
                    </button>
                  </div>

                  <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-none">
                    <div className="flex flex-col items-center text-center mt-2 gap-2">
                      <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center relative shadow">
                        <UserIcon className="w-8 h-8 text-cyan-400" />
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border border-slate-900 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{currentUser.name}</h4>
                        <span className="text-[10px] text-slate-400 block">{currentUser.email}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex flex-col gap-2 text-xs">
                      <div className="flex justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">Security Scope</span>
                        <strong className="text-white">{currentUser.role}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">Subscription Tier</span>
                        <strong className="text-cyan-400">{currentUser.tier}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">Account status</span>
                        <strong className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          VERIFIED
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Joined</span>
                        <span className="text-slate-300 font-mono text-[10px]">{new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-cyan-400">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* --- SCREEN 8: SETTINGS & PREFERENCES --- */}
              {currentScreen === EmulatorScreen.SETTINGS && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Settings className="w-4 h-4 text-cyan-400" />
                      Client Preferences
                    </span>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono"
                    >
                      ➔ Close
                    </button>
                  </div>

                  <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-none text-xs">
                    
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Security Settings</span>
                      
                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div>
                          <strong className="text-white block font-medium">Biometric Login</strong>
                          <span className="text-[9px] text-slate-500 block">Enables FaceID bypass signature</span>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentUser(prev => {
                              const toggled = !prev.biometricsEnabled;
                              addSysLog(`Toggled Biometrics state: ${toggled}`);
                              return { ...prev, biometricsEnabled: toggled };
                            });
                          }}
                          className={`w-10 h-6 rounded-full p-1 transition-colors ${currentUser.biometricsEnabled ? "bg-cyan-500" : "bg-slate-700"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentUser.biometricsEnabled ? "translate-x-4" : "translate-x-0"}`}></div>
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div>
                          <strong className="text-white block font-medium">Push Notifications</strong>
                          <span className="text-[9px] text-slate-500 block">Register Firebase push token</span>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentUser(prev => {
                              const toggled = !prev.pushNotifications;
                              addSysLog(`Toggled Push notifications token registry: ${toggled}`);
                              return { ...prev, pushNotifications: toggled };
                            });
                          }}
                          className={`w-10 h-6 rounded-full p-1 transition-colors ${currentUser.pushNotifications ? "bg-cyan-500" : "bg-slate-700"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentUser.pushNotifications ? "translate-x-4" : "translate-x-0"}`}></div>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">User Preferences</span>
                      
                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div>
                          <strong className="text-white block font-medium">App Theme</strong>
                          <span className="text-[9px] text-slate-500 block">Current client color space</span>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentUser(prev => {
                              const nextTheme = prev.theme === "dark" ? "light" : "dark";
                              addSysLog(`Client requested app theme toggle: ${nextTheme}`);
                              return { ...prev, theme: nextTheme };
                            });
                          }}
                          className="px-2.5 py-1 bg-slate-850 border border-slate-800 rounded font-mono text-[9px] font-bold text-white capitalize"
                        >
                          {currentUser.theme} Mode
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* --- SCREEN 9: SAVINGS VAULTS --- */}
              {currentScreen === EmulatorScreen.VAULTS && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-display uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Savings Vaults
                    </span>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                    >
                      ➔ Close
                    </button>
                  </div>

                  <div className="flex-1 p-4 flex flex-col gap-3.5 overflow-y-auto scrollbar-none">
                    
                    {/* Vaults Alert Messages */}
                    {vaultSuccessMsg && (
                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{vaultSuccessMsg}</span>
                      </div>
                    )}
                    {vaultErrorMsg && (
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{vaultErrorMsg}</span>
                      </div>
                    )}

                    {/* Balance display in Vault Screen */}
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">Available Ledger</span>
                        <strong className="text-base font-extrabold text-white font-mono">${currentUser.balance.toFixed(2)}</strong>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider bg-slate-800/80 text-cyan-400 border border-slate-700/50 px-2 py-0.5 rounded-full font-mono">
                        Active Account
                      </span>
                    </div>

                    {/* Active Vaults List */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Smart Vaults</span>
                        <span className="text-[9px] text-slate-500">{vaults.length} targets active</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {vaults.map((vault) => {
                          const percent = Math.min(100, (vault.saved / vault.target) * 100);
                          const isSelected = selectedVaultId === vault.id;
                          return (
                            <div
                              key={vault.id}
                              onClick={() => {
                                setSelectedVaultId(vault.id);
                                setVaultSuccessMsg(null);
                                setVaultErrorMsg(null);
                              }}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-slate-800/60 border-amber-500/50 shadow-md shadow-amber-500/5" 
                                  : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-850/40"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm p-1 bg-slate-950 rounded border border-slate-850">{vault.icon}</span>
                                  <div>
                                    <h4 className="text-[11px] font-bold text-white leading-tight">{vault.title}</h4>
                                    <span className="text-[8px] text-slate-400 uppercase font-mono">{vault.category}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-bold text-amber-400 block font-mono">${vault.saved.toLocaleString()}</span>
                                  <span className="text-[8px] text-slate-500 block font-mono">Target: ${vault.target.toLocaleString()}</span>
                                </div>
                              </div>
                              
                              {/* Linear progress bar */}
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2 relative">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center text-[8px] text-slate-500 mt-1">
                                <span>{percent.toFixed(0)}% Completed</span>
                                {isSelected && <span className="text-amber-400 font-bold uppercase tracking-wider font-mono text-[7px]">Selected Target</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Transfer to/from Vault Controller */}
                    {selectedVaultId && (
                      <form onSubmit={handleVaultAction} className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Manage Selected Goal</span>
                          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                            <button
                              type="button"
                              onClick={() => setVaultActionType("deposit")}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${
                                vaultActionType === "deposit" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                              }`}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setVaultActionType("withdraw")}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${
                                vaultActionType === "withdraw" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                              }`}
                            >
                              Retrieve
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 items-center mt-1">
                          <div className="col-span-3 relative">
                            <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-mono">$</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={vaultAmountInput}
                              onChange={(e) => setVaultAmountInput(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-6 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold py-1.5 px-2 rounded-xl text-[10px] text-center transition-all cursor-pointer"
                          >
                            Go
                          </button>
                        </div>

                        {/* Amount presets */}
                        <div className="flex gap-1.5 mt-0.5">
                          {["50", "250", "1000", "5000"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setVaultAmountInput(preset)}
                              className="flex-1 py-1 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded text-[8px] font-mono transition-colors cursor-pointer"
                            >
                              +${preset}
                            </button>
                          ))}
                        </div>
                      </form>
                    )}

                    {/* Create New Smart Vault Trigger and Form */}
                    <div className="mt-1">
                      {!showCreateVaultForm ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateVaultForm(true);
                            setVaultSuccessMsg(null);
                            setVaultErrorMsg(null);
                          }}
                          className="w-full py-2 bg-slate-900/20 border border-dashed border-slate-800 hover:border-slate-700 hover:text-white text-[10px] text-slate-400 rounded-xl text-center transition-all cursor-pointer"
                        >
                          + Create New Smart Vault
                        </button>
                      ) : (
                        <form onSubmit={handleCreateVault} className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2.5 animate-fade-in">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">New Savings Parameter</span>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-mono uppercase text-slate-500">Vault Title</label>
                            <input
                              type="text"
                              value={newVaultTitle}
                              onChange={(e) => setNewVaultTitle(e.target.value)}
                              placeholder="e.g. Real Estate Acquisition"
                              className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] font-mono uppercase text-slate-500">Savings Target</label>
                              <input
                                type="number"
                                value={newVaultTarget}
                                onChange={(e) => setNewVaultTarget(e.target.value)}
                                placeholder="10000"
                                className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] font-mono uppercase text-slate-500">Category</label>
                              <select
                                value={newVaultCategory}
                                onChange={(e) => setNewVaultCategory(e.target.value)}
                                className="bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-[11px] text-white focus:outline-none"
                              >
                                <option value="Investments">Investments</option>
                                <option value="Vehicle">Vehicle</option>
                                <option value="Travel">Travel</option>
                                <option value="Tax">Tax</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="General">General</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => setShowCreateVaultForm(false)}
                              className="flex-1 py-1.5 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-[10px] text-center font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[10px] text-center font-bold transition-colors cursor-pointer"
                            >
                              Establish Vault
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500 hover:text-white">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500 hover:text-white">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500 hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500 hover:text-white">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* --- SCREEN 10: VAULT GALLERY --- */}
              {currentScreen === EmulatorScreen.GALLERY && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-display uppercase tracking-wider">
                      <Image className="w-4 h-4 text-violet-400" />
                      Secure Gallery
                    </span>
                    <button
                      onClick={() => {
                        setCurrentScreen(EmulatorScreen.DASHBOARD);
                        setSelectedPhotoId(null);
                        setCameraOpen(false);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                    >
                      ➔ Close
                    </button>
                  </div>

                  {/* Body container */}
                  <div className="flex-1 flex flex-col overflow-hidden relative">
                    
                    {/* View Photo Full-screen Overlay */}
                    {selectedPhotoId && (
                      (() => {
                        const currentPhoto = galleryPhotos.find(p => p.id === selectedPhotoId);
                        if (!currentPhoto) return null;
                        return (
                          <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col animate-fade-in">
                            <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between bg-slate-950 shrink-0">
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate font-mono">
                                {currentPhoto.title}
                              </span>
                              <button
                                onClick={() => setSelectedPhotoId(null)}
                                className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer"
                              >
                                ➔ Back
                              </button>
                            </div>
                            <div className="flex-1 flex items-center justify-center p-2 bg-[#05070e]">
                              <img
                                src={currentPhoto.url}
                                alt={currentPhoto.title}
                                referrerPolicy="no-referrer"
                                className="max-h-[220px] max-w-full rounded-lg object-contain shadow-2xl border border-slate-850"
                              />
                            </div>
                            <div className="p-4 bg-slate-950 border-t border-slate-900 shrink-0 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider font-mono">{currentPhoto.category}</span>
                                <span className="text-[8px] text-slate-500 font-mono">{currentPhoto.date}</span>
                              </div>
                              <p className="text-[10px] text-slate-300 font-sans italic">"{currentPhoto.details}"</p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleToggleLikePhoto(currentPhoto.id)}
                                  className={`flex-1 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    currentPhoto.liked 
                                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                                      : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${currentPhoto.liked ? "fill-rose-500" : ""}`} />
                                  {currentPhoto.liked ? "Favorite" : "Mark Fav"}
                                </button>
                                <button
                                  onClick={() => handleDeletePhoto(currentPhoto.id)}
                                  className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-850 hover:border-rose-900/30 text-[10px] text-slate-400 flex items-center justify-center cursor-pointer transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Camera Viewfinder Overlay */}
                    {cameraOpen && (
                      <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col animate-fade-in">
                        <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between bg-slate-950 shrink-0">
                          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            AuraCam Live
                          </span>
                          <button
                            onClick={() => setCameraOpen(false)}
                            className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        {/* Simulation Screen Viewport */}
                        <div className="flex-1 bg-black relative overflow-hidden flex flex-col justify-between p-4">
                          {/* Corner alignment bracket decorators */}
                          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/40"></div>
                          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
                          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
                          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/40"></div>
                          
                          {/* Live scanning HUD line */}
                          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-bounce"></div>

                          {/* Subject selection text HUD */}
                          <div className="mt-2 text-center z-10">
                            <span className="text-[8px] uppercase tracking-widest font-mono text-cyan-400 block mb-0.5">Target Parameter</span>
                            <span className="text-xs font-bold text-white tracking-wide font-display">{cameraSubject}</span>
                          </div>

                          {/* Dynamic subject illustration preview */}
                          <div className="flex-1 flex items-center justify-center p-4">
                            <div className="w-28 h-28 rounded-full border border-dashed border-white/20 flex items-center justify-center animate-spin-slow">
                              <Camera className="w-8 h-8 text-white/30 animate-pulse" />
                            </div>
                          </div>

                          {/* Bottom Selector & Shutter HUD */}
                          <form onSubmit={handleTakePhoto} className="flex flex-col gap-3.5 items-center z-10">
                            <div className="flex bg-slate-900/80 backdrop-blur rounded-lg p-0.5 border border-slate-800 w-full justify-between max-w-[220px]">
                              {["Quantum Grid", "Network Cluster", "Neon Architecture", "Ledger Database"].map((sub) => (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => setCameraSubject(sub)}
                                  className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase transition-all cursor-pointer ${
                                    cameraSubject === sub ? "bg-cyan-500 text-slate-950 font-black" : "text-slate-400"
                                  }`}
                                >
                                  {sub.split(" ")[0]}
                                </button>
                              ))}
                            </div>

                            {/* Circular shutter trigger */}
                            <button
                              type="submit"
                              className="w-14 h-14 rounded-full border-4 border-white/40 p-1 flex items-center justify-center bg-transparent active:scale-90 transition-all cursor-pointer hover:border-white"
                            >
                              <div className="w-full h-full rounded-full bg-white active:bg-rose-500 transition-colors"></div>
                            </button>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Standard Gallery Catalog Listing */}
                    <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-none">
                      
                      {/* Filter Shelf */}
                      <div className="flex items-center justify-between shrink-0">
                        <select
                          value={galleryCategory}
                          onChange={(e) => setGalleryCategory(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[9px] text-white focus:outline-none"
                        >
                          <option value="All">All Categories</option>
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Workstations">Workstations</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Abstract">Abstract</option>
                          <option value="Captured">Captured</option>
                        </select>

                        <button
                          onClick={() => setPhotoFilterLiked(prev => !prev)}
                          className={`text-[9px] font-mono border px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                            photoFilterLiked 
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Heart className={`w-2.5 h-2.5 ${photoFilterLiked ? "fill-rose-500" : ""}`} />
                          Favorites Only
                        </button>
                      </div>

                      {/* Photo grid of 2 columns */}
                      <div className="grid grid-cols-2 gap-2">
                        {galleryPhotos
                          .filter(p => galleryCategory === "All" || p.category === galleryCategory)
                          .filter(p => !photoFilterLiked || p.liked)
                          .map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => setSelectedPhotoId(photo.id)}
                              className="group relative h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-violet-500/40 transition-all"
                            >
                              <img
                                src={photo.url}
                                alt={photo.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              {/* Dark fade shadow overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2">
                                <h5 className="text-[9px] font-bold text-white truncate leading-tight">{photo.title}</h5>
                                <span className="text-[7px] text-slate-400 uppercase font-mono tracking-wide">{photo.category}</span>
                              </div>

                              {/* Heart liked pill indicator */}
                              {photo.liked && (
                                <div className="absolute top-1.5 right-1.5 p-1 bg-slate-950/60 backdrop-blur rounded-full">
                                  <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-500" />
                                </div>
                              )}
                            </div>
                        ))}
                      </div>

                      {/* Camera launch trigger block */}
                      <div className="mt-auto shrink-0 pt-2">
                        <button
                          onClick={() => setCameraOpen(true)}
                          className="w-full py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 active:scale-95 text-slate-950 font-bold rounded-xl text-[10px] text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Launch Aura Camera
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500 hover:text-white">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500 hover:text-white">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500 hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500 hover:text-white">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* --- SCREEN 11: CALCULATOR --- */}
              {currentScreen === EmulatorScreen.CALCULATOR && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-display uppercase tracking-wider">
                      <Calculator className="w-4 h-4 text-rose-400" />
                      Smart Calc
                    </span>
                    <button
                      onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)}
                      className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                    >
                      ➔ Close
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
                    
                    {/* Upper Calculation Display Screen */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-900 p-3.5 flex flex-col justify-end text-right min-h-[90px] shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 block h-4 overflow-x-auto whitespace-nowrap scrollbar-none">
                        {calcFormula || "Ready for parameter"}
                      </span>
                      <strong className="text-xl font-mono text-white tracking-tight truncate block">
                        {calcDisplay}
                      </strong>
                    </div>

                    {/* Pre-sets shelf */}
                    <div className="grid grid-cols-3 gap-1.5 mt-2 shrink-0">
                      <button
                        onClick={() => handleCalcKeyPress("TAX")}
                        className="py-1 px-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-[8px] font-bold text-rose-400 border border-rose-900/20 transition-all cursor-pointer text-center"
                      >
                        Corp Tax (21%)
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("VAT")}
                        className="py-1 px-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-[8px] font-bold text-rose-400 border border-rose-900/20 transition-all cursor-pointer text-center"
                      >
                        VAT (15%)
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("INT")}
                        className="py-1 px-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-[8px] font-bold text-rose-400 border border-rose-900/20 transition-all cursor-pointer text-center"
                      >
                        Interest (5%)
                      </button>
                    </div>

                    {/* Button Grid layout */}
                    <div className="grid grid-cols-4 gap-1.5 mt-3 flex-1 items-center">
                      {/* Clear / Operators Row */}
                      <button
                        onClick={() => handleCalcKeyPress("C")}
                        className="h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        C
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("⌫")}
                        className="h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        ⌫
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("/")}
                        className="h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        ÷
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("*")}
                        className="h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        ×
                      </button>

                      {/* 7,8,9 Row */}
                      <button
                        onClick={() => handleCalcKeyPress("7")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        7
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("8")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        8
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("9")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        9
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("-")}
                        className="h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        -
                      </button>

                      {/* 4,5,6 Row */}
                      <button
                        onClick={() => handleCalcKeyPress("4")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        4
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("5")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        5
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("6")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        6
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("+")}
                        className="h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        +
                      </button>

                      {/* 1,2,3 Row */}
                      <button
                        onClick={() => handleCalcKeyPress("1")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        1
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("2")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("3")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        3
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress("=")}
                        className="h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-black text-slate-950 transition-colors cursor-pointer"
                      >
                        =
                      </button>
                    </div>

                    {/* Zero and point controls */}
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5 shrink-0">
                      <button
                        onClick={() => handleCalcKeyPress("0")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        0
                      </button>
                      <button
                        onClick={() => handleCalcKeyPress(".")}
                        className="h-10 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-900 transition-colors cursor-pointer"
                      >
                        .
                      </button>
                    </div>

                    {/* Integrated smart deposit credit function */}
                    <div className="mt-3 pt-2 shrink-0 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={handleDepositCalculation}
                        disabled={parseFloat(calcDisplay) <= 0 || isNaN(parseFloat(calcDisplay))}
                        className="w-full py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-30 disabled:pointer-events-none active:scale-95 text-slate-950 font-bold rounded-xl text-[10px] text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Credit Calculation to Ledger
                      </button>
                      <span className="text-[8px] text-slate-500 text-center block mt-1 font-mono uppercase tracking-wider">
                        Adds display amount to Active Balance
                      </span>
                    </div>

                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500 hover:text-white">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500 hover:text-white">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500 hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500 hover:text-white">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* --- SCREEN 12: SECURE NOTES --- */}
              {currentScreen === EmulatorScreen.NOTES && (
                <div className="flex-1 flex flex-col animate-fade-in text-slate-100 bg-[#070a13]">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-display uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-orange-400" />
                      Secure Notes
                    </span>
                    <button
                      onClick={() => {
                        setCurrentScreen(EmulatorScreen.DASHBOARD);
                        setActiveNoteId(null);
                        setShowCreateNote(false);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                    >
                      ➔ Close
                    </button>
                  </div>

                  {/* Body container */}
                  <div className="flex-1 flex flex-col overflow-hidden relative">

                    {/* Single Active Note Detail Modal / overlay */}
                    {activeNoteId && (
                      (() => {
                        const activeNote = notes.find(n => n.id === activeNoteId);
                        if (!activeNote) return null;
                        return (
                          <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col animate-fade-in">
                            <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between bg-slate-950 shrink-0">
                              <span className="text-[10px] font-bold text-orange-400 font-mono uppercase tracking-wider">
                                {activeNote.category} notepad
                              </span>
                              <button
                                onClick={() => setActiveNoteId(null)}
                                className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer"
                              >
                                ➔ Back
                              </button>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto scrollbar-none flex flex-col gap-2 bg-[#05070e]">
                              <span className="text-[8px] font-mono text-slate-500 uppercase">{activeNote.date}</span>
                              <h4 className="text-sm font-bold text-white tracking-tight border-b border-slate-900 pb-2 leading-snug">
                                {activeNote.title}
                              </h4>
                              <p className="text-[11px] text-slate-300 font-sans whitespace-pre-wrap leading-relaxed pt-1.5 font-mono">
                                {activeNote.content}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-950 border-t border-slate-900 shrink-0">
                              <button
                                onClick={() => handleDeleteNote(activeNote.id)}
                                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Shred Security Memo
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* New Note Form Overlay */}
                    {showCreateNote && (
                      <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col animate-fade-in">
                        <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between bg-slate-950 shrink-0">
                          <span className="text-[10px] font-bold text-orange-400 font-mono uppercase tracking-wider">
                            New Notepad Entry
                          </span>
                          <button
                            onClick={() => setShowCreateNote(false)}
                            className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <form onSubmit={handleCreateNote} className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-none bg-[#05070e]">
                          <div className="flex flex-col gap-1 shrink-0">
                            <label className="text-[8px] font-mono uppercase text-slate-500">Note Title</label>
                            <input
                              type="text"
                              value={newNoteTitle}
                              onChange={(e) => setNewNoteTitle(e.target.value)}
                              placeholder="e.g. Ingress JWT Refresh Key"
                              required
                              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1 shrink-0">
                            <label className="text-[8px] font-mono uppercase text-slate-500">Classification</label>
                            <select
                              value={newNoteCategory}
                              onChange={(e) => setNewNoteCategory(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-orange-500"
                            >
                              <option value="General">General</option>
                              <option value="Confidential">Confidential</option>
                              <option value="Ledger Key">Ledger Key</option>
                              <option value="Ideas">Ideas</option>
                            </select>
                          </div>

                          <div className="flex-1 flex flex-col gap-1 min-h-[140px]">
                            <label className="text-[8px] font-mono uppercase text-slate-500">Notepad Contents</label>
                            <textarea
                              value={newNoteContent}
                              onChange={(e) => setNewNoteContent(e.target.value)}
                              placeholder="Write secret workspace blueprints, system metrics, or diary memos..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] text-white focus:outline-none focus:border-orange-500 resize-none font-mono"
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-bold rounded-xl text-[10px] text-center transition-all cursor-pointer"
                          >
                            Commit Secure Note
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Standard Notes Listing */}
                    <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-none">
                      
                      {/* Search Bar */}
                      <div className="shrink-0">
                        <input
                          type="text"
                          placeholder="Search classified memos..."
                          value={notesSearchQuery}
                          onChange={(e) => setNotesSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Notes grid */}
                      <div className="flex flex-col gap-2">
                        {notes
                          .filter(n => !notesSearchQuery || n.title.toLowerCase().includes(notesSearchQuery.toLowerCase()) || n.content.toLowerCase().includes(notesSearchQuery.toLowerCase()))
                          .map((note) => (
                            <div
                              key={note.id}
                              onClick={() => setActiveNoteId(note.id)}
                              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-orange-500/30 text-left cursor-pointer transition-all"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-[11px] font-bold text-white truncate max-w-[170px] leading-tight">{note.title}</h4>
                                <span className="text-[7px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">
                                  {note.category}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-400 truncate max-w-[240px] font-mono leading-tight">{note.content}</p>
                              <span className="text-[7px] text-slate-500 block font-mono text-right mt-1.5">{note.date}</span>
                            </div>
                        ))}
                      </div>

                      {/* Add new Note trigger block */}
                      <div className="mt-auto shrink-0 pt-2">
                        <button
                          onClick={() => {
                            setShowCreateNote(true);
                            setNewNoteTitle("");
                            setNewNoteContent("");
                          }}
                          className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-slate-950 font-bold rounded-xl text-[10px] text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 font-bold" />
                          Compose Secure Note
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Simulated Nav Bar */}
                  <div className="h-12 border-t border-slate-900 bg-[#090c15] flex items-center justify-around shrink-0">
                    <button onClick={() => setCurrentScreen(EmulatorScreen.DASHBOARD)} className="text-slate-500 hover:text-white">
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.MAP)} className="text-slate-500 hover:text-white">
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.CHAT)} className="text-slate-500 hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentScreen(EmulatorScreen.PROFILE)} className="text-slate-500 hover:text-white">
                      <UserIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom hardware home handle */}
            <div className="h-5 flex items-center justify-center relative mt-1 z-50">
              <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
            </div>

          </div>

        </div>

      </main>

      {/* WORKSPACE ANALYTICS METRICS RIBBON */}
      {false && (
      <footer className="mt-auto border-t border-slate-800 bg-[#0c101b] px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Users (24H)</span>
          <span className="text-sm font-bold text-white font-mono">{dashboardStats.activeUsers24h?.toLocaleString() || "18,450"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">REST API Success Rate</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{dashboardStats.apiSuccessRate || "99.94%"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Redis Cache Hit Rate</span>
          <span className="text-sm font-bold text-indigo-400 font-mono">{dashboardStats.redisCacheHitRate || "89.4%"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Average Latency</span>
          <span className="text-sm font-bold text-white font-mono">{dashboardStats.averageLatencyMs || "42"} ms</span>
        </div>
        <div className="flex flex-col col-span-2 md:col-span-1 gap-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Tickets</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{dashboardStats.activeSupportTickets || "3"} queue</span>
        </div>
      </footer>
      )}

    </div>
  );
}
