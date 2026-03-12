import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Page } from "../App";
import { METRO_CITIES } from "../components/Navbar";
import "./AddCycle.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
interface Props { setPage: (p: Page) => void; }

export default function AddCycle({ setPage }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({ model: "", price: "", image: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const shopCity = user?.location || "";
  const cityAllowed = METRO_CITIES.includes(shopCity);

  const submit = async () => {
    setError(""); setSuccess("");
    if (!form.model || !form.price) return setError("Model and price are required");
    if (!cityAllowed) return setError("Your city is not in our service area");

    setLoading(true);
    try {
      const res = await fetch(`${API}/cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user!.token}` },
        body: JSON.stringify({ model: form.model, price: Number(form.price), location: shopCity, image: form.image || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`"${form.model}" added to ${shopCity}!`);
      setForm({ model: "", price: "", image: "" });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  if (!user || user.role !== "shopkeeper") return (
    <div className="addcycle-page fade-in">
      <div className="ac-gate">
        <div>🔐</div><h2>Shopkeepers only</h2>
        <p>Sign in as a shopkeeper to add cycles</p>
        <button className="btn btn-primary" onClick={() => setPage("auth")}>Sign in</button>
      </div>
    </div>
  );

  return (
    <div className="addcycle-page fade-in">
      <div className="wrap ac-wrap">
        <div className="label">Shopkeeper</div>
        <h1 className="ac-h1">Add a cycle</h1>
        <p className="ac-sub">List your cycle for riders in <strong>{shopCity || "your city"}</strong></p>

        {!cityAllowed && (
          <div className="msg-err" style={{ maxWidth: 480 }}>
            ⚠️ Your city "{shopCity}" is not in our service area yet. We currently serve: {METRO_CITIES.join(", ")}.
          </div>
        )}

        <div className="ac-layout">
          <div className="ac-form card fade-up">
            <div className="ac-city-info">
              <span className="badge badge-orange">📍 {shopCity || "No city set"}</span>
              <span className="ac-city-note">Cycles are listed in your registered city</span>
            </div>

            <div className="fg">
              <label className="fl">Cycle model *</label>
              <input className="input" placeholder="e.g. Mountain Pro X1" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} disabled={!cityAllowed} />
            </div>

            <div className="fg">
              <label className="fl">Price per hour (₹) *</label>
              <input className="input" type="number" placeholder="e.g. 49" min="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} disabled={!cityAllowed} />
            </div>

            <div className="fg">
              <label className="fl">Image URL <span style={{ fontWeight: 400, color: "var(--text3)" }}>(optional)</span></label>
              <input className="input" placeholder="https://..." value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} disabled={!cityAllowed} />
            </div>

            {error && <div className="msg-err">{error}</div>}
            {success && <div className="msg-ok">✓ {success}</div>}

            <div className="ac-btns">
              <button className="btn btn-primary" style={{ flex: 1, padding: "12px" }} onClick={submit} disabled={loading || !cityAllowed}>
                {loading ? "Adding..." : "Add cycle"}
              </button>
              <button className="btn btn-ghost" onClick={() => setPage("cycles")}>View all →</button>
            </div>
          </div>

          <div className="ac-preview card fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="acp-label">Preview</div>
            <div className="acp-card">
              <div className="acp-img">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                  <path d="M15 6a1 1 0 0 0-1-1h-4l-3 9h10l-2-8z"/><path d="M12 6l2 8"/>
                </svg>
                <span className="cc-badge avail">Available</span>
              </div>
              <div className="acp-body">
                <div style={{ fontSize: 12, color: "var(--text3)" }}>📍 {shopCity || "—"}</div>
                <div className="acp-name">{form.model || "Cycle model"}</div>
                <div className="acp-price">{form.price ? `₹${form.price}` : "₹--"}<span>/hr</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
