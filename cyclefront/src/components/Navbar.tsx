import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import type { Page } from "../App";
import "./Navbar.css";

export const METRO_CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Surat"];

interface Props { page: Page; setPage: (p: Page) => void; }

export default function Navbar({ page, setPage }: Props) {
  const { user, setUser } = useAuth();
  const { notifs, unread, markRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);

  const isShop = user?.role === "shopkeeper";
  const isAdmin = user?.role === "admin";

  const toggleNotifs = () => {
    if (!showNotifs) markRead();
    setShowNotifs(s => !s);
  };

  const formatTime = (dt: string) => {
    const d = new Date(dt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner wrap">
        <div className="navbar-brand" onClick={() => setPage("home")}>
          <div className="brand-mark">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
              <path d="M15 6a1 1 0 0 0-1-1h-4l-3 9h10l-2-8z"/><path d="M12 6l2 8"/>
            </svg>
          </div>
          <span className="brand-text">CycleRent</span>
        </div>

        <div className="navbar-links">
          <button className={`nav-link ${page==="home"?"active":""}`} onClick={() => setPage("home")}>Home</button>
          <button className={`nav-link ${page==="cycles"?"active":""}`} onClick={() => setPage("cycles")}>Cycles</button>
          {user && !isShop && !isAdmin && (
            <button className={`nav-link ${page==="booking"?"active":""}`} onClick={() => setPage("booking")}>My bookings</button>
          )}
          {isShop && (
            <>
              <button className={`nav-link nav-add ${page==="addcycle"?"active":""}`} onClick={() => setPage("addcycle")}>+ Add cycle</button>
              <button className={`nav-link ${page==="shopdash"?"active":""}`} onClick={() => setPage("shopdash")}>Dashboard</button>
            </>
          )}
          {isAdmin && (
            <button className={`nav-link nav-admin ${page==="admin"?"active":""}`} onClick={() => setPage("admin")}>Admin panel</button>
          )}
        </div>

        <div className="navbar-right">
          {user && (
            <div className="notif-wrap">
              <button className="notif-btn" onClick={toggleNotifs}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
              </button>

              {showNotifs && (
                <div className="notif-dropdown card">
                  <div className="notif-head">
                    <span>Notifications</span>
                    {unread > 0 && <span className="notif-all-read">All read</span>}
                  </div>
                  <div className="notif-list">
                    {notifs.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : notifs.slice(0, 20).map(n => (
                      <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                        <div className="notif-dot" />
                        <div className="notif-content">
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{formatTime(n.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="user-area">
              <div className="user-chip">
                <div className="user-dot">{user.name?.[0]?.toUpperCase()}</div>
                <span>{user.name?.split(" ")[0]}</span>
                {(isShop || isAdmin) && <span className="role-tag">{isAdmin ? "Admin" : "Shop"}</span>}
              </div>
              <button className="btn btn-ghost" style={{ padding: "7px 13px", fontSize: "13px" }}
                onClick={() => { setUser(null); localStorage.removeItem("crUser"); setPage("home"); }}>
                Sign out
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setPage("auth")}>Sign in</button>
          )}
        </div>
      </div>

      {showNotifs && <div className="notif-backdrop" onClick={() => setShowNotifs(false)} />}
    </nav>
  );
}
