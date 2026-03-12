import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type { Page } from "../App";
import "./Booking.css";

const API = "http://localhost:5000";
interface Props { setPage: (p: Page) => void; selectedCycle: any; }

const STATUS_STEPS: Record<string, { label: string; icon: string; step: number }> = {
  confirmed: { label: "Booking confirmed", icon: "✓", step: 1 },
  active:    { label: "Cycle handed over", icon: "🚲", step: 2 },
  completed: { label: "Ride completed",    icon: "⭐", step: 3 },
  cancelled: { label: "Cancelled",         icon: "✕", step: 0 },
};

function BookingStatus({ booking }: { booking: any }) {
  const steps = [
    { key: "confirmed", label: "Booking confirmed", sub: "Waiting for shopkeeper to hand over" },
    { key: "active",    label: "Cycle handed over", sub: "Ride in progress" },
    { key: "completed", label: "Ride completed",    sub: "Thank you for riding!" },
  ];
  const cur = STATUS_STEPS[booking.status]?.step ?? 0;

  if (booking.status === "cancelled") return (
    <div className="status-track cancelled">
      <div className="st-icon">✕</div>
      <div className="st-text">Booking cancelled</div>
    </div>
  );

  return (
    <div className="status-track">
      {steps.map((s, i) => {
        const done = cur > i + 1;
        const active = cur === i + 1;
        return (
          <div key={s.key} className={`st-step ${done ? "done" : active ? "active" : ""}`}>
            <div className="st-dot">
              {done ? "✓" : active ? <span className="st-pulse" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className="st-line" />}
            <div className="st-info">
              <div className="st-label">{s.label}</div>
              {active && <div className="st-sub">{s.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useTimer(deliveredAt: string | null) {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    if (!deliveredAt) return;
    const tick = () => {
      const diff = Date.now() - new Date(deliveredAt).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deliveredAt]);
  return elapsed;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className="star"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}>
          {n <= (hover || value) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function RatingModal({ booking, token, onClose, onDone }: any) {
  const [cr, setCr] = useState(0); const [sr, setSr] = useState(0);
  const [cc, setCc] = useState(""); const [sc, setSc] = useState("");
  const [loading, setLoading] = useState(false); const [done, setDone] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (cr > 0) await fetch(`${API}/ratings/cycle`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body: JSON.stringify({ bookingId: booking.id, cycleId: booking.cycleId, rating: cr, comment: cc }) });
      if (sr > 0) await fetch(`${API}/ratings/shopkeeper`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body: JSON.stringify({ bookingId: booking.id, shopkeeperId: booking.cycle?.shopkeeperId, rating: sr, comment: sc }) });
      setDone(true); setTimeout(onDone, 1200);
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box card fade-up" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="modal-done"><div>⭐</div><h3>Thanks for the feedback!</h3></div>
        ) : (
          <>
            <div className="modal-head"><h3>Rate your ride</h3><button className="modal-close" onClick={onClose}>✕</button></div>
            <div className="modal-body">
              <div className="rate-section">
                <div className="rate-label">Cycle — {booking.cycle?.model}</div>
                <StarPicker value={cr} onChange={setCr} />
                <textarea className="input rate-comment" placeholder="How was the cycle?" value={cc} onChange={e => setCc(e.target.value)} rows={2} />
              </div>
              <div className="rate-section">
                <div className="rate-label">Shopkeeper — {booking.cycle?.shopkeeper?.name}</div>
                <StarPicker value={sr} onChange={setSr} />
                <textarea className="input rate-comment" placeholder="How was the service?" value={sc} onChange={e => setSc(e.target.value)} rows={2} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={onClose}>Skip</button>
              <button className="btn btn-primary" onClick={submit} disabled={loading || (cr===0 && sr===0)}>{loading ? "Submitting..." : "Submit"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ b, token, onRefresh }: any) {
  const elapsed = useTimer(b.status === "active" ? b.deliveredAt : null);
  const [ratingFor, setRatingFor] = useState(false);
  const canCancel = b.status === "confirmed" && (Date.now() - new Date(b.bookedAt).getTime()) < 600000;

  const cancel = async () => {
    const r = await fetch(`${API}/bookings/cancel/${b.id}`, { method:"PATCH", headers:{Authorization:`Bearer ${token}`} });
    if (r.ok) onRefresh(); else { const d = await r.json(); alert(d.error); }
  };
  const complete = async () => {
    await fetch(`${API}/bookings/complete/${b.id}`, { method:"PATCH", headers:{Authorization:`Bearer ${token}`} });
    onRefresh(); setRatingFor(true);
  };

  return (
    <div className="bk-item card">
      {ratingFor && <RatingModal booking={b} token={token} onClose={() => setRatingFor(false)} onDone={() => { setRatingFor(false); onRefresh(); }} />}

      <div className="bi-top">
        <div className="bi-left">
          <div className="bi-icon">🚲</div>
          <div>
            <div className="bi-name">{b.cycle?.model}</div>
            <div className="bi-meta">📍 {b.cycle?.location} · 🏪 {b.cycle?.shopkeeper?.name}</div>
            <div className="bi-meta">🗓 {new Date(b.startTime).toLocaleDateString("en-IN",{day:"numeric",month:"short"})} → {new Date(b.endTime).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
            <div className="bi-amount">₹{b.totalAmount?.toFixed(2)}</div>
          </div>
        </div>
        <div className="bi-right">
          <span className={`badge ${b.status==="confirmed"?"badge-orange":b.status==="active"?"badge-blue":b.status==="completed"?"badge-green":"badge-gray"}`}>{b.status}</span>
        </div>
      </div>

      {b.status !== "cancelled" && <BookingStatus booking={b} />}

      {b.status === "active" && elapsed && (
        <div className="ride-timer">
          <span>🕐 Ride in progress</span>
          <span className="rt-elapsed">{elapsed}</span>
        </div>
      )}

      {/* Shopkeeper contact */}
      <div className="contact-box">
        <div className="cb-title">Shopkeeper details</div>
        <div className="cb-row">
          <span>👤 {b.cycle?.shopkeeper?.name}</span>
          <span>📞 {b.cycle?.shopkeeper?.phone || "—"}</span>
        </div>
        <div className="cb-row">
          <span>📧 {b.cycle?.shopkeeper?.email}</span>
          <span>📍 {b.cycle?.shopkeeper?.address || b.cycle?.shopkeeper?.location}</span>
        </div>
      </div>

      <div className="bi-actions">
        {canCancel && <button className="btn btn-outline" style={{fontSize:13,padding:"7px 13px"}} onClick={cancel}>Cancel booking</button>}
        {b.status === "active" && <button className="btn btn-primary" style={{fontSize:13,padding:"7px 13px"}} onClick={complete}>Mark ride done</button>}
        {b.status === "completed" && !b.cycleRating && <button className="btn btn-outline" style={{fontSize:13,padding:"7px 13px"}} onClick={() => setRatingFor(true)}>Rate ride ⭐</button>}
      </div>
    </div>
  );
}

export default function Booking({ setPage, selectedCycle }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"book"|"history">("book");
  const [bookings, setBookings] = useState<any[]>([]);
  const [form, setForm] = useState({ startTime: "", endTime: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user?.token) return;
    const r = await fetch(`${API}/bookings/my`, { headers: { Authorization:`Bearer ${user.token}` } });
    const d = await r.json();
    if (Array.isArray(d)) setBookings(d);
  }, [user]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const calcAmount = () => {
    if (!form.startTime || !form.endTime || !selectedCycle) return 0;
    const ms = new Date(form.endTime).getTime() - new Date(form.startTime).getTime();
    if (ms <= 0) return 0;
    return Math.round((ms / 3600000) * selectedCycle.price * 100) / 100;
  };

  const calcDuration = () => {
    if (!form.startTime || !form.endTime) return "";
    const ms = new Date(form.endTime).getTime() - new Date(form.startTime).getTime();
    if (ms <= 0) return "";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const book = async () => {
    setError(""); setSuccess("");
    if (!form.startTime || !form.endTime) return setError("Choose start and end time");
    if (new Date(form.endTime) <= new Date(form.startTime)) return setError("End time must be after start time");
    setLoading(true);
    try {
      const r = await fetch(`${API}/bookings`, {
        method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${user!.token}`},
        body: JSON.stringify({ cycleId: selectedCycle.id, startTime: form.startTime, endTime: form.endTime }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSuccess("Booking confirmed! 🎉");
      fetchBookings();
      setTimeout(() => { setTab("history"); setSuccess(""); }, 1400);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (!user) return (
    <div className="booking-page fade-in">
      <div className="bk-gate"><div>🔐</div><h2>Sign in to book</h2><button className="btn btn-primary" onClick={() => setPage("auth")}>Sign in</button></div>
    </div>
  );

  return (
    <div className="booking-page fade-in">
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-box card fade-up" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><h3>Payment</h3><button className="modal-close" onClick={() => setShowPayment(false)}>✕</button></div>
            <div className="payment-notice">
              <div>🔧</div>
              <h4>Payment not integrated yet</h4>
              <p>Pay directly to the shopkeeper in cash when picking up your cycle. Online payment coming soon!</p>
              <button className="btn btn-primary" onClick={() => setShowPayment(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}

      <div className="wrap bk-wrap">
        <div className="label">Bookings</div>
        <h1 className="bk-h1">My bookings</h1>

        <div className="bk-tabs">
          <button className={`bk-tab ${tab==="book"?"on":""}`} onClick={() => setTab("book")}>New booking</button>
          <button className={`bk-tab ${tab==="history"?"on":""}`} onClick={() => setTab("history")}>
            History {bookings.length > 0 && <span className="bk-badge">{bookings.length}</span>}
          </button>
        </div>

        {tab === "book" && (
          <div className="fade-up">
            {selectedCycle ? (
              <div className="bk-layout">
                <div className="bk-summary card">
                  <div className="bs-row">
                    <div className="bs-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                        <path d="M15 6a1 1 0 0 0-1-1h-4l-3 9h10l-2-8z"/><path d="M12 6l2 8"/>
                      </svg>
                    </div>
                    <div>
                      <div className="bs-name">{selectedCycle.model}</div>
                      <div className="bs-loc">📍 {selectedCycle.location}</div>
                    </div>
                  </div>
                  <div className="bs-price">₹{selectedCycle.price}<span>/hr</span></div>
                  <div className="bs-shop">
                    <div className="bss-title">Shopkeeper</div>
                    <div className="bss-name">🏪 {selectedCycle.shopkeeper?.name}</div>
                    <div className="bss-info">📞 {selectedCycle.shopkeeper?.phone || "—"}</div>
                    <div className="bss-info">📍 {selectedCycle.shopkeeper?.address || selectedCycle.shopkeeper?.location}</div>
                    <div className="bss-info">📧 {selectedCycle.shopkeeper?.email}</div>
                  </div>
                  <button className="btn btn-ghost" style={{width:"100%",fontSize:13}} onClick={() => setShowPayment(true)}>💳 Payment info</button>
                </div>

                <div className="bk-form card">
                  <h3 className="bf-title">Choose your time</h3>
                  <div className="fg"><label className="fl">Start time</label><input className="input" type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({...f,startTime:e.target.value}))} /></div>
                  <div className="fg"><label className="fl">End time</label><input className="input" type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({...f,endTime:e.target.value}))} /></div>
                  {calcAmount() > 0 && (
                    <div className="cost-box">
                      <div className="cost-row"><span>Duration</span><span>{calcDuration()}</span></div>
                      <div className="cost-row"><span>Rate</span><span>₹{selectedCycle.price}/hr</span></div>
                      <div className="cost-row total"><span>Estimated total</span><span>₹{calcAmount().toFixed(2)}</span></div>
                      <div className="cost-note">Final amount calculated by exact duration at ride completion</div>
                    </div>
                  )}
                  {error && <div className="msg-err">{error}</div>}
                  {success && <div className="msg-ok">{success}</div>}
                  <button className="btn btn-primary" style={{width:"100%",padding:"12px"}} onClick={book} disabled={loading}>{loading?"Confirming...":"Confirm booking"}</button>
                  <button className="btn btn-ghost" style={{width:"100%"}} onClick={() => setPage("cycles")}>← Pick another cycle</button>
                </div>
              </div>
            ) : (
              <div className="bk-gate"><div>🚲</div><h3>No cycle selected</h3><button className="btn btn-primary" onClick={() => setPage("cycles")}>Browse cycles</button></div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="fade-up">
            {bookings.length === 0 ? (
              <div className="bk-gate"><div>📋</div><h3>No bookings yet</h3><button className="btn btn-primary" onClick={() => setTab("book")}>Book now</button></div>
            ) : (
              <div className="bk-list">
                {bookings.map(b => <BookingCard key={b.id} b={b} token={user.token} onRefresh={fetchBookings} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
