import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Page } from "../App";
import "./Home.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
interface Props { setPage: (p: Page) => void; }

function useCountdown(endTime: string | null) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Time's up!"); setUrgent(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 900000);
      setTimeLeft(`${h>0?`${h}h `:""}${m}m ${s}s`);
    };
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return { timeLeft, urgent };
}

const CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad"];

const features = [
  { icon:"⚡", t:"Book in 30 seconds", d:"No queues, no paperwork. Find and confirm instantly." },
  { icon:"📍", t:"Find nearby cycles", d:"Browse available cycles across your city." },
  { icon:"💰", t:"Pay per minute", d:"Exact pricing down to the minute. No rounding up." },
  { icon:"⭐", t:"Verified ratings", d:"Real reviews from real riders on every cycle." },
  { icon:"🛠️", t:"Well maintained", d:"Every cycle is checked and serviced regularly." },
  { icon:"📱", t:"Easy returns", d:"Drop off at the shop — shopkeeper confirms done." },
];

export default function Home({ setPage }: Props) {
  const { user } = useAuth();
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [stats, setStats] = useState({ users: "2,000+", shopkeepers: "150+", cycles: "500+", cities: CITIES.length });

  useEffect(() => {
    if (!user?.token || user.role !== "user") return;
    fetch(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const active = data.find((b: any) => b.status === "active");
        setActiveBooking(active || null);
      }).catch(() => {});
  }, [user]);

  const { timeLeft, urgent } = useCountdown(activeBooking?.deliveredAt
    ? new Date(new Date(activeBooking.deliveredAt).getTime() +
        (new Date(activeBooking.endTime).getTime() - new Date(activeBooking.startTime).getTime())).toISOString()
    : null);

  return (
    <div className="home fade-in">
      {/* Active ride timer */}
      {activeBooking && (
        <div className={`timer-banner ${urgent?"urgent":""}`}>
          <div className="wrap timer-inner">
            <div className="timer-left">
              <div className="timer-icon">🚲</div>
              <div>
                <div className="timer-label">Ride in progress — {activeBooking.cycle?.model}</div>
                <div className="timer-loc">📍 {activeBooking.cycle?.location} · 🏪 {activeBooking.cycle?.shopkeeper?.name}</div>
              </div>
            </div>
            <div className="timer-right">
              <div className="timer-time">{timeLeft}</div>
              <div className="timer-sub">{urgent ? "⚠ ending soon!" : "remaining"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="hero">
        <div className="hero-grain" />
        <div className="wrap hero-inner">
          <div className="hero-text fade-up">
            <div className="label">Cycle rental across India</div>
            <h1 className="hero-h1">The simplest way<br />to rent a cycle</h1>
            <p className="hero-p">Find and book cycles across {CITIES.length} major cities. Instant confirmation, fair pricing, easy returns.</p>
            <div className="hero-btns">
              <button className="btn btn-primary hero-cta" onClick={() => setPage("cycles")}>Find a cycle</button>
              {!user && <button className="btn btn-outline hero-cta" onClick={() => setPage("auth")}>Create account</button>}
            </div>
            <div className="hero-cities">
              {CITIES.map(c => <span key={c} className="hero-city">{c}</span>)}
            </div>
          </div>

          <div className="hero-card-wrap fade-up" style={{ animationDelay:"0.12s" }}>
            <div className="hero-card card">
              <div className="hc-header">
                <span className="badge badge-green">● Available now</span>
                <span className="hc-price">₹49<span>/hr</span></span>
              </div>
              <div className="hc-visual">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                  <path d="M15 6a1 1 0 0 0-1-1h-4l-3 9h10l-2-8z"/><path d="M12 6l2 8"/>
                </svg>
              </div>
              <div className="hc-info">
                <div className="hc-name">Mountain Pro X1</div>
                <div className="hc-loc">📍 Hyderabad · ⭐ 4.8</div>
              </div>
              <button className="btn btn-primary" style={{width:"100%",marginTop:10}} onClick={() => setPage("cycles")}>Book now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="wrap stats-inner">
          {[
            { n:"500+", l:"Cycles", color:"#e85d26", bg:"#fff3ee" },
            { n:"2,000+", l:"Riders", color:"#2563eb", bg:"#eff6ff" },
            { n:"10+", l:"Cities", color:"#16a34a", bg:"#f0fdf4" },
            { n:"4.8", l:"Avg rating", color:"#d97706", bg:"#fffbeb" },
          ].map(s => (
            <div key={s.l} className="stat" style={{"--stat-color":s.color,"--stat-bg":s.bg} as any}>
              <div className="stat-n">{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="features-sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="label">Why riders choose us</div>
            <h2 className="sec-h2">Everything for a smooth ride</h2>
          </div>
          <div className="features-grid">
            {features.map((f,i) => (
              <div key={i} className="feat-card card fade-up" style={{animationDelay:`${0.06*i}s`}}>
                <div className="feat-icon">{f.icon}</div>
                <h3 className="feat-t">{f.t}</h3>
                <p className="feat-d">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-sec">
        <div className="wrap cta-inner">
          <h2 className="cta-h2">Ready to ride?</h2>
          <p className="cta-p">Join thousands of riders across India.</p>
          <div className="hero-btns">
            {user
              ? <button className="btn btn-primary hero-cta" onClick={() => setPage("cycles")}>Browse cycles</button>
              : <button className="btn btn-primary hero-cta" onClick={() => setPage("auth")}>Get started free</button>
            }
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">CycleRent</span>
            <span className="footer-tag">India's cycle rental platform</span>
          </div>
          <div className="footer-right">
            <div className="footer-addr">📍 CycleRent Technologies Pvt. Ltd.</div>
            <div className="footer-addr">4th Floor, Prestige Tech Park, Outer Ring Road</div>
            <div className="footer-addr">Marathahalli, Bangalore – 560103, Karnataka</div>
            <div className="footer-addr">📞 +91 80 4567 8901 · 📧 support@cyclerent.in</div>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2025 CycleRent · All rights reserved</span>
          <span>Serving {CITIES.join(", ")} & more</span>
        </div>
      </footer>
    </div>
  );
}
