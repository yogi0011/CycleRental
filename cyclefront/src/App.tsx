import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ThemeContext } from "./context/ThemeContext";
import { AuthContext, AuthUser } from "./context/AuthContext";
import { NotificationContext, Notif } from "./context/NotificationContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Cycles from "./pages/Cycles";
import Booking from "./pages/Booking";
import AddCycle from "./pages/AddCycle";
import Admin from "./pages/Admin";
import ShopDashboard from "./pages/ShopDashboard";
import "./App.css";

export type Page = "home" | "auth" | "cycles" | "booking" | "addcycle" | "admin" | "shopdash";
const API =  import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("crUser");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem("crUser", JSON.stringify(u));
    else localStorage.removeItem("crUser");
  }, []);

  const fetchNotifs = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${user.token}` } });
      const d = await res.json();
      if (Array.isArray(d)) setNotifs(d);
    } catch { }
  }, [user]);

  const markRead = useCallback(async () => {
    if (!user?.token) return;
    await fetch(`${API}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}` } });
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  }, [user]);

  // Socket connection
  useEffect(() => {
    if (!user) { socket?.disconnect(); socket = null; return; }

    socket = io(API, { transports: ["websocket"] });

    socket.on("connect", () => {
      const room = user.role === "user" ? `user_${user.id}` : user.role === "shopkeeper" ? `shop_${user.id}` : "admins";
      socket?.emit("join", room);
    });

    socket.on("notification", (notif: Notif) => {
      setNotifs(prev => [notif, ...prev]);
    });

    fetchNotifs();

    return () => { socket?.disconnect(); socket = null; };
  }, [user]);

  const unread = notifs.filter(n => !n.read).length;

  return (
    <ThemeContext.Provider value={{ theme: "light", setTheme: () => {}, accentColor: "#e85d26", setAccentColor: () => {} }}>
      <AuthContext.Provider value={{ user, setUser }}>
        <NotificationContext.Provider value={{ notifs, unread, fetchNotifs, markRead }}>
          <div className="app">
            <Navbar page={page} setPage={setPage} />
            <main className="main-content">
              {page === "home"      && <Home setPage={setPage} />}
              {page === "auth"      && <Auth setPage={setPage} />}
              {page === "cycles"    && <Cycles setPage={setPage} setSelectedCycle={setSelectedCycle} />}
              {page === "booking"   && <Booking setPage={setPage} selectedCycle={selectedCycle} />}
              {page === "addcycle"  && <AddCycle setPage={setPage} />}
              {page === "admin"     && <Admin setPage={setPage} />}
              {page === "shopdash"  && <ShopDashboard setPage={setPage} />}
            </main>
          </div>
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
