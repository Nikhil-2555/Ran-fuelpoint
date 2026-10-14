import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { adminService, DEFAULT_GROUP_ID } from "@/services/adminService";
import type { AdminProfile, Customer, Group, Notification, Transaction, Worker } from "@/services/types";

interface AdminState {
  authReady: boolean;
  authed: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  profile: AdminProfile;
  updateProfile: (patch: Partial<AdminProfile>) => void;
  customers: Customer[];
  workers: Worker[];
  groups: Group[];
  transactions: Transaction[];
  notifications: Notification[];
  unreadCount: number;
  assignCustomerGroup: (customerId: string, groupId: string) => void;
  saveGroup: (group: Omit<Group, "createdAt"> & { createdAt?: string }) => void;
  deleteGroup: (groupId: string) => void;
  toggleGroupActive: (groupId: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  saveCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  saveWorker: (worker: Worker) => void;
  deleteWorker: (workerId: string) => void;
}

const AdminContext = createContext<AdminState | null>(null);

const AUTH_KEY = "fuelpoint-admin-authed";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>(() => adminService.getProfile());
  const [customers, setCustomers] = useState<Customer[]>(() => adminService.getCustomers());
  const [groups, setGroups] = useState<Group[]>(() => adminService.getGroups());
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    adminService.getNotifications(),
  );
  const [workers, setWorkers] = useState<Worker[]>(() => adminService.getWorkers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => adminService.getTransactions());

  // Restore the session after a page refresh (client-side only).
  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "1" && sessionStorage.getItem("fuelpoint-token")) {
      setAuthed(true);
    } else {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem("fuelpoint-token");
    }
    setAuthReady(true);
  }, []);

  // Fetch live data from backend
  useEffect(() => {
    if (authed) {
      const token = sessionStorage.getItem("fuelpoint-token");
      const options: RequestInit = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const API_URL = import.meta.env.VITE_API_URL as string;
      Promise.all([
        fetch(`${API_URL}/auth/me`, options).then(r => r.json()),
        fetch(`${API_URL}/customers`, options).then(r => r.json()),
        fetch(`${API_URL}/workers`, options).then(r => r.json()),
        fetch(`${API_URL}/groups`, options).then(r => r.json()),
        fetch(`${API_URL}/transactions`, options).then(r => r.json())
      ]).then(([authRes, cRes, wRes, gRes, tRes]) => {
        // If the token is invalid/expired, log out
        if (cRes?.status === "error" && cRes?.message?.includes("Unauthorized")) {
          setAuthed(false);
          sessionStorage.removeItem(AUTH_KEY);
          sessionStorage.removeItem("fuelpoint-token");
          return;
        }

        if (authRes?.admin) {
          const a = authRes.admin;
          setProfile(prev => ({
            ...prev,
            name: a.name,
            email: a.email,
            phone: a.phone || prev.phone,
            location: a.location || prev.location,
            initials: a.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
          }));
        }

        if (cRes?.data) {
          setCustomers(cRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone || "",
            email: c.email || "",
            vehicle: c.vehicle || "",
            groupId: c.group_id || DEFAULT_GROUP_ID,
            registeredAt: c.registered_at || new Date().toISOString(),
            lastActivity: c.last_visit || null,
            transactions: parseInt(c.transactions || 0),
            totalSpend: parseFloat(c.total_spent || 0),
            discountReceived: parseFloat(c.discount_received || 0),
            status: c.status || "active"
          })));
        }
        if (wRes?.data) {
          setWorkers(wRes.data.map((w: any) => ({
            id: w.id,
            name: w.name,
            email: w.email || "",
            phone: w.phone || "",
            shift: w.shift || "Morning",
            status: w.status || "active",
            joinedAt: w.joined_at || new Date().toISOString(),
            scans: parseInt(w.scans || 0),
            customersScanned: parseInt(w.customers_scanned || w.scans || 0),
            transactions: parseInt(w.transactions || w.scans || 0),
            discountProcessed: parseFloat(w.discount_processed || 0),
            lastActivity: w.last_activity || w.last_active || new Date().toISOString()
          })));
        }
        if (gRes?.data) {
          setGroups(gRes.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            discountPercent: parseFloat(g.discount_percent || g.discount_percentage || 0),
            description: "",
            active: true,
            createdAt: new Date().toISOString(),
            isDefault: g.is_default
          })));
        }
        if (tRes?.data) {
          setTransactions(tRes.data.map((t: any) => ({
            id: t.id,
            customerId: t.customer_id,
            customerName: t.customer_name || "Unknown",
            workerId: t.worker_id,
            workerName: t.worker_name || "Unknown",
            groupId: t.group_id || DEFAULT_GROUP_ID,
            amount: parseFloat(t.amount || t.total_amount || 0),
            discountPercent: parseFloat(t.discount_percent || 0),
            discountAmount: parseFloat(t.discount_amount || 0),
            litres: parseFloat(t.litres || t.volume || 0),
            fuel: t.fuel || t.fuel_type || "Petrol",
            createdAt: t.created_at || new Date().toISOString()
          })));
        }
      }).catch(err => console.error("Failed to fetch live data", err));
    }
  }, [authed]);

  const login = useCallback(async (email: string, password?: string, remember: boolean = true) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.accessToken) {
        setAuthed(true);
        setProfile((p) => ({ ...p, email: email || p.email }));
        sessionStorage.setItem("fuelpoint-token", data.accessToken);
        
        if (typeof window !== "undefined") {
          if (remember) {
            sessionStorage.setItem(AUTH_KEY, "1");
          } else {
            sessionStorage.removeItem(AUTH_KEY);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthed(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem("fuelpoint-token");
    }
  }, []);

  const assignCustomerGroup = useCallback(
    (customerId: string, groupId: string) => {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== customerId) return c;
          const g = groups.find((x) => x.id === groupId);
          return {
            ...c,
            groupId,
            status: groupId === DEFAULT_GROUP_ID ? c.status : c.transactions > 0 ? "active" : c.status,
            discountReceived: Math.round((c.totalSpend * (g?.discountPercent ?? 0)) / 100),
          };
        }),
      );
      setNotifications((prev) =>
        prev.map((n) => (n.customerId === customerId ? { ...n, read: true } : n)),
      );
    },
    [groups],
  );

  const saveGroup: AdminState["saveGroup"] = useCallback((group) => {
    setGroups((prev) => {
      const exists = prev.some((g) => g.id === group.id);
      if (exists) return prev.map((g) => (g.id === group.id ? { ...g, ...group } : g));
      return [{ ...group, createdAt: group.createdAt ?? new Date().toISOString() }, ...prev];
    });
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setCustomers((prev) =>
      prev.map((c) =>
        c.groupId === groupId ? { ...c, groupId: DEFAULT_GROUP_ID, discountReceived: 0 } : c,
      ),
    );
  }, []);

  const toggleGroupActive = useCallback((groupId: string) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, active: !g.active } : g)));
  }, []);

  const saveCustomer = useCallback((customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      if (exists) return prev.map((c) => (c.id === customer.id ? customer : c));
      return [customer, ...prev];
    });
  }, []);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  }, []);

  const saveWorker = useCallback((worker: Worker) => {
    setWorkers((prev) => {
      const exists = prev.some((w) => w.id === worker.id);
      if (exists) return prev.map((w) => (w.id === worker.id ? worker : w));
      return [worker, ...prev];
    });
  }, []);

  const deleteWorker = useCallback((workerId: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  }, []);

  const value: AdminState = {
    authReady,
    authed,
    login,
    logout,
    profile,
    updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
    customers,
    workers,
    groups,
    transactions,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    assignCustomerGroup,
    saveGroup,
    deleteGroup,
    toggleGroupActive,
    markRead: (id) =>
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    saveCustomer,
    deleteCustomer,
    saveWorker,
    deleteWorker,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
