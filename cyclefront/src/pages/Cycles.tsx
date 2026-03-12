import { useState, useEffect } from "react";
import type { Page } from "../App";
import { METRO_CITIES } from "../components/Navbar";
import "./Cycles.css";

const API = "http://localhost:5000";
interface Props { setPage: (p: Page) => void; setSelectedCycle: (c: any) => void; }

function StarDisplay({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <span className="cycle-stars">
      <span className="cs-filled">{"★".repeat(Math.round(rounded))}</span>
      <span className="cs-empty">{"☆".repeat(5 - Math.round(rounded))}</span>
      <span className="cs-val">{rounded.toFixed(1)}{count !== undefined ? ` (${count})` : ""}</span>
    </span>
  );
}

export default function Cycles({ setPage, setSelectedCycle }: Props) {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [sort, setSort] = useState<"asc"|"desc">("asc");

  useEffect(() => {
    fetch(`${API}/cycles`)
      .then(r => r.json())
      .then(d => { setCycles(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const avgRating = (ratings: any[]) => {
    if (!ratings?.length) return null;
    return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
  };

  const list = cycles
    .filter(c => !search || c.model.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !city || c.location === city)
    .filter(c => !onlyAvail || c.available)
    .sort((a, b) => sort === "asc" ? a.price - b.price : b.price - a.price);

  return (
    <div className="cycles-page fade-in">
      <div className="cycles-head">
        <div className="wrap">
          <div className="label">Browse</div>
          <h1 className="cycles-h1">Available cycles</h1>
          <div className="cycles-filters">
            <input className="input" style={{ maxWidth: 240 }} placeholder="Search model..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="input" style={{ maxWidth: 180 }} value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All cities</option>
              {METRO_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className={`filter-btn ${onlyAvail ? "on" : ""}`} onClick={() => setOnlyAvail(!onlyAvail)}>
              {onlyAvail ? "● Available only" : "All cycles"}
            </button>
            <select className="input" style={{ maxWidth: 180 }} value={sort} onChange={e => setSort(e.target.value as any)}>
              <option value="asc">Price: low → high</option>
              <option value="desc">Price: high → low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="wrap cycles-body">
        {loading ? (
          <div className="cycles-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skel" style={{ height: 280 }} />)}
          </div>
        ) : list.length === 0 ? (
          <div className="empty">
            <div>🔍</div>
            <h3>Nothing found</h3>
            <p>Try different search or filters</p>
          </div>
        ) : (
          <div className="cycles-grid">
            {list.map((c, i) => {
              const avg = avgRating(c.ratings);
              return (
                <div key={c.id} className="cycle-card card fade-up" style={{ animationDelay: `${0.04*i}s` }}>
                  <div className="cc-img">
                    <div className="cc-icon">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                        <path d="M15 6a1 1 0 0 0-1-1h-4l-3 9h10l-2-8z"/><path d="M12 6l2 8"/>
                      </svg>
                    </div>
                    <span className={`cc-badge ${c.available ? "avail" : "busy"}`}>{c.available ? "Available" : "Booked"}</span>
                  </div>
                  <div className="cc-body">
                    <div className="cc-meta">📍 {c.location} · 🏪 {c.shopkeeper?.name}</div>
                    <h3 className="cc-name">{c.model}</h3>
                    {avg !== null && <StarDisplay value={avg} count={c.ratings.length} />}
                    <div className="cc-foot">
                      <div className="cc-price">₹{c.price}<span>/hr</span></div>
                      <button
                        className={`btn ${c.available ? "btn-primary" : "btn-ghost"}`}
                        style={{ padding: "8px 15px", fontSize: "13px" }}
                        disabled={!c.available}
                        onClick={() => { if (c.available) { setSelectedCycle(c); setPage("booking"); } }}>
                        {c.available ? "Book" : "Taken"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="cycles-count">{list.length} cycle{list.length !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}
