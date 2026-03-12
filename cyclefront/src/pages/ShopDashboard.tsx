import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type { Page } from "../App";
import "./ShopDashboard.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
interface Props { setPage: (p: Page) => void; }

const STATUS_COLOR: Record<string, string> = {
  confirmed: "badge-orange", active: "badge-blue",
  completed: "badge-green", cancelled: "badge-gray", pending: "badge-gray",
};

export default function ShopDashboard({ setPage }: Props) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active"|"all">("active");
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetch_ = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/bookings/shop`, { headers: { Authorization: `Bearer ${user.token}` } });
      const d = await r.json();
      if (Array.isArray(d)) setBookings(d);
    } catch { } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const deliver = async (id: number) => {
    await fetch(`${API}/bookings/deliver/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${user!.token}` } });
    fetch_();
  };

  const list = tab === "active"
    ? bookings.filter(b => b.status === "confirmed" || b.status === "active")
    : bookings;

  if (!user || user.role !== "shopkeeper") return (
    <div className="sd-page fade-in">
      <div className="sd-gate"><div>🔐</div><h2>Shopkeepers only</h2><button className="btn btn-primary" onClick={() => setPage("auth")}>Sign in</button></div>
    </div>
  );

  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const active = bookings.filter(b => b.status === "active").length;
  const completed = bookings.filter(b => b.status === "completed").length;

  return (
    <div className="sd-page fade-in">
      <div className="wrap sd-wrap">
        <div className="label">Shop</div>
        <h1 className="sd-h1">Your dashboard</h1>
        <p className="sd-sub">📍 {user.location} {user.address ? `· ${user.address}` : ""} · 📞 {user.phone}</p>

        <div className="sd-stats">
          {[
            { n: confirmed, l: "Awaiting delivery", c: "orange" },
            { n: active, l: "Active rides", c: "blue" },
            { n: completed, l: "Completed", c: "green" },
            { n: bookings.length, l: "Total bookings", c: "gray" },
          ].map(s => (
            <div key={s.l} className={`sd-stat card sd-stat-${s.c}`}>
              <div className="sd-stat-n">{s.n}</div>
              <div className="sd-stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="sd-tabs">
          <button className={`bk-tab ${tab==="active"?"on":""}`} onClick={() => setTab("active")}>
            Active {confirmed+active > 0 && <span className="bk-badge">{confirmed+active}</span>}
          </button>
          <button className={`bk-tab ${tab==="all"?"on":""}`} onClick={() => setTab("all")}>All bookings</button>
        </div>

        {loading ? (
          <div className="sd-loading">Loading...</div>
        ) : list.length === 0 ? (
          <div className="sd-empty">
            <div>📭</div>
            <h3>{tab === "active" ? "No active bookings" : "No bookings yet"}</h3>
            <p>New bookings will appear here instantly</p>
          </div>
        ) : (
          <div className="sd-list">
            {list.map(b => (
              <div key={b.id} className="sd-card card">
                <div className="sd-card-top" onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                  <div className="sd-card-left">
                    <div className="sd-cycle-icon">🚲</div>
                    <div>
                      <div className="sd-cycle-name">{b.cycle?.model} <span className="sd-bid">#{b.id}</span></div>
                      <div className="sd-cycle-meta">
                        {new Date(b.startTime).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})} →{" "}
                        {new Date(b.endTime).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                      </div>
                      <div className="sd-amount">₹{b.totalAmount?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="sd-card-right">
                    <span className={`badge ${STATUS_COLOR[b.status] || "badge-gray"}`}>{b.status}</span>
                    <span className="sd-chevron">{expanded === b.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expanded === b.id && (
                  <div className="sd-card-body fade-up">
                    {/* Customer info */}
                    <div className="sd-contact">
                      <div className="sd-contact-title">Customer details</div>
                      <div className="sd-contact-grid">
                        <div className="sd-ci"><span>👤</span>{b.user?.name}</div>
                        <div className="sd-ci"><span>📞</span>{b.user?.phone || "Not provided"}</div>
                        <div className="sd-ci"><span>📧</span>{b.user?.email}</div>
                        <div className="sd-ci"><span>🚲</span>Cycle #{b.cycleId}</div>
                      </div>
                    </div>

                    {/* Status flow */}
                    <div className="sd-status-row">
                      <div className={`sd-status-step ${b.status !== "pending" && b.status !== "cancelled" ? "done" : ""}`}>
                        <div className="sd-ss-dot">✓</div>
                        <div className="sd-ss-label">Booking confirmed</div>
                      </div>
                      <div className="sd-status-line" />
                      <div className={`sd-status-step ${b.status === "active" || b.status === "completed" ? "done" : ""}`}>
                        <div className={`sd-ss-dot ${b.status === "confirmed" ? "pending" : ""}`}>
                          {b.status === "confirmed" ? "…" : "✓"}
                        </div>
                        <div className="sd-ss-label">Cycle delivered</div>
                      </div>
                      <div className="sd-status-line" />
                      <div className={`sd-status-step ${b.status === "completed" ? "done" : ""}`}>
                        <div className="sd-ss-dot">{b.status === "completed" ? "✓" : "3"}</div>
                        <div className="sd-ss-label">Ride done</div>
                      </div>
                    </div>

                    {b.status === "confirmed" && (
                      <button className="btn btn-primary" style={{width:"100%"}} onClick={() => deliver(b.id)}>
                        🚲 Mark cycle as delivered to customer
                      </button>
                    )}
                    {b.status === "active" && (
                      <div className="sd-active-note">
                        Cycle is with customer. Customer will mark ride done when finished.
                      </div>
                    )}
                    {b.cycleRating && (
                      <div className="sd-rating">
                        <span>Customer rated: {"★".repeat(b.cycleRating.rating)}{"☆".repeat(5-b.cycleRating.rating)}</span>
                        {b.cycleRating.comment && <span className="sd-rating-comment">"{b.cycleRating.comment}"</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
