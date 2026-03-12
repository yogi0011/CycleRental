import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Page } from "../App";
import { METRO_CITIES } from "../components/Navbar";
import "./Admin.css";

const API = "http://localhost:5000";
interface Props { setPage: (p: Page) => void; }

export default function Admin({ setPage }: Props) {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [msg, setMsg] = useState({ type:"", text:"" });
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [tab, setTab] = useState<"cycles"|"bookings">("cycles");

  const headers = { "Content-Type":"application/json", Authorization:`Bearer ${user?.token}` };

  useEffect(() => {
    if (!user?.token) return;
    Promise.all([
      fetch(`${API}/admin/cycles`, { headers }).then(r => r.json()),
      fetch(`${API}/admin/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/admin/bookings`, { headers }).then(r => r.json()),
    ]).then(([c, s, b]) => {
      setCycles(Array.isArray(c) ? c : []);
      setStats(s);
      setAllBookings(Array.isArray(b) ? b : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const startEdit = (c: any) => { setEditId(c.id); setEditForm({ model: c.model, price: c.price, location: c.location, available: c.available, image: c.image || "" }); };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API}/admin/cycles/${editId}`, { method:"PUT", headers, body: JSON.stringify({ ...editForm, price: Number(editForm.price), available: editForm.available === true || editForm.available === "true" }) });
      if (!res.ok) throw new Error((await res.json()).error);
      setCycles(cs => cs.map(c => c.id === editId ? { ...c, ...editForm } : c));
      setEditId(null);
      setMsg({ type:"ok", text:"Cycle updated!" });
      setTimeout(() => setMsg({ type:"", text:"" }), 2000);
    } catch (e: any) { setMsg({ type:"err", text: e.message }); }
  };

  const deleteCycle = async (id: number) => {
    try {
      await fetch(`${API}/admin/cycles/${id}`, { method:"DELETE", headers });
      setCycles(cs => cs.filter(c => c.id !== id));
      setConfirmDelete(null);
      setMsg({ type:"ok", text:"Deleted." });
      setTimeout(() => setMsg({ type:"", text:"" }), 2000);
    } catch { setMsg({ type:"err", text:"Delete failed" }); }
  };

  const toggleAvail = async (c: any) => {
    await fetch(`${API}/admin/cycles/${c.id}`, { method:"PUT", headers, body: JSON.stringify({ model: c.model, price: c.price, location: c.location, available: !c.available, image: c.image }) });
    setCycles(cs => cs.map(x => x.id === c.id ? { ...x, available: !x.available } : x));
  };

  const filtered = cycles.filter(c => !search || c.model.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()));
  const filteredBookings = allBookings.filter(b => !search || b.cycle?.model?.toLowerCase().includes(search.toLowerCase()) || b.user?.name?.toLowerCase().includes(search.toLowerCase()));

  const STATUS_COLOR: Record<string, string> = { confirmed:"badge-orange", active:"badge-blue", completed:"badge-green", cancelled:"badge-gray" };

  if (!user || user.role !== "admin") return (
    <div className="admin-page fade-in">
      <div className="admin-gate"><div>🔐</div><h2>Admin access only</h2><button className="btn btn-primary" onClick={() => setPage("auth")}>Sign in</button></div>
    </div>
  );

  return (
    <div className="admin-page fade-in">
      {/* Booking detail modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-box card fade-up" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Booking #{selectedBooking.id}</h3>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>
            <div className="ab-detail">
              <div className="abd-section">
                <div className="abd-title">Customer</div>
                <div className="abd-row"><span>👤 Name</span><strong>{selectedBooking.user?.name}</strong></div>
                <div className="abd-row"><span>📞 Phone</span><strong>{selectedBooking.user?.phone || "—"}</strong></div>
                <div className="abd-row"><span>📧 Email</span><strong>{selectedBooking.user?.email}</strong></div>
              </div>
              <div className="abd-section">
                <div className="abd-title">Cycle & Shop</div>
                <div className="abd-row"><span>🚲 Cycle</span><strong>{selectedBooking.cycle?.model} (ID #{selectedBooking.cycleId})</strong></div>
                <div className="abd-row"><span>🏪 Shop</span><strong>{selectedBooking.cycle?.shopkeeper?.name}</strong></div>
                <div className="abd-row"><span>📞 Shop phone</span><strong>{selectedBooking.cycle?.shopkeeper?.phone}</strong></div>
                <div className="abd-row"><span>📍 Address</span><strong>{selectedBooking.cycle?.shopkeeper?.address || selectedBooking.cycle?.shopkeeper?.location}</strong></div>
                <div className="abd-row"><span>📧 Shop email</span><strong>{selectedBooking.cycle?.shopkeeper?.email}</strong></div>
              </div>
              <div className="abd-section">
                <div className="abd-title">Booking details</div>
                <div className="abd-row"><span>📅 Start</span><strong>{new Date(selectedBooking.startTime).toLocaleString("en-IN")}</strong></div>
                <div className="abd-row"><span>📅 End</span><strong>{new Date(selectedBooking.endTime).toLocaleString("en-IN")}</strong></div>
                <div className="abd-row"><span>💰 Amount</span><strong>₹{selectedBooking.totalAmount?.toFixed(2)}</strong></div>
                <div className="abd-row"><span>Status</span><span className={`badge ${STATUS_COLOR[selectedBooking.status]||"badge-gray"}`}>{selectedBooking.status}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wrap admin-wrap">
        <div className="admin-header">
          <div><div className="label">Admin</div><h1 className="admin-h1">Control panel</h1></div>
        </div>

        {stats && (
          <div className="admin-stats">
            {[["Riders",stats.users,"🧑","#eff6ff","#2563eb"],["Shopkeepers",stats.shopkeepers,"🏪","#f0fdf4","#16a34a"],["Cycles",stats.cycles,"🚲","#fff3ee","#e85d26"],["Bookings",stats.bookings,"📋","#fefce8","#d97706"]].map(([l,n,ic,bg,color]) => (
              <div key={String(l)} className="astat card" style={{"--astat-bg":bg,"--astat-color":color} as any}>
                <div className="astat-icon">{ic}</div>
                <div className="astat-n">{n}</div>
                <div className="astat-l">{l}</div>
              </div>
            ))}
          </div>
        )}

        {msg.text && <div className={msg.type==="ok"?"msg-ok":"msg-err"} style={{maxWidth:480}}>{msg.text}</div>}

        <div className="admin-tabs">
          <button className={`bk-tab ${tab==="cycles"?"on":""}`} onClick={() => setTab("cycles")}>Cycles ({cycles.length})</button>
          <button className={`bk-tab ${tab==="bookings"?"on":""}`} onClick={() => setTab("bookings")}>All bookings ({allBookings.length})</button>
        </div>

        <div className="card admin-table-wrap">
          <div className="at-head">
            <h3 className="at-title">{tab === "cycles" ? "All cycles" : "All bookings"}</h3>
            <input className="input" style={{maxWidth:220}} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div style={{padding:"32px",textAlign:"center",color:"var(--text3)"}}>Loading...</div>
          ) : tab === "cycles" ? (
            <div className="at-list">
              {filtered.map(c => (
                <div key={c.id} className="at-row">
                  {editId === c.id ? (
                    <div className="at-edit">
                      <input className="input" placeholder="Model" value={editForm.model} onChange={e => setEditForm((f: any) => ({...f,model:e.target.value}))} />
                      <input className="input" type="number" placeholder="Price" value={editForm.price} onChange={e => setEditForm((f: any) => ({...f,price:e.target.value}))} />
                      <select className="input" value={editForm.location} onChange={e => setEditForm((f: any) => ({...f,location:e.target.value}))}>
                        {METRO_CITIES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                      </select>
                      <select className="input" value={String(editForm.available)} onChange={e => setEditForm((f: any) => ({...f,available:e.target.value==="true"}))}>
                        <option value="true">Available</option><option value="false">Booked</option>
                      </select>
                      <div className="at-edit-btns">
                        <button className="btn btn-primary" style={{padding:"7px 14px",fontSize:"13px"}} onClick={saveEdit}>Save</button>
                        <button className="btn btn-ghost" style={{padding:"7px 14px",fontSize:"13px"}} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="at-info">
                        <div className="at-name">{c.model} <span style={{fontSize:11,color:"var(--text3)"}}>#{c.id}</span></div>
                        <div className="at-meta">📍 {c.location} · ₹{c.price}/hr · 🏪 {c.shopkeeper?.name}</div>
                      </div>
                      <div className="at-actions">
                        <span className={`badge ${c.available?"badge-green":"badge-red"}`}>{c.available?"Available":"Booked"}</span>
                        <button className="btn btn-ghost" style={{padding:"6px 11px",fontSize:"12px"}} onClick={() => toggleAvail(c)}>Toggle</button>
                        <button className="btn btn-outline" style={{padding:"6px 11px",fontSize:"12px"}} onClick={() => startEdit(c)}>Edit</button>
                        {confirmDelete === c.id ? (
                          <div className="at-confirm">
                            <span style={{fontSize:12}}>Sure?</span>
                            <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:"12px"}} onClick={() => deleteCycle(c.id)}>Yes</button>
                            <button className="btn btn-ghost" style={{padding:"5px 10px",fontSize:"12px"}} onClick={() => setConfirmDelete(null)}>No</button>
                          </div>
                        ) : (
                          <button className="btn btn-danger" style={{padding:"6px 11px",fontSize:"12px"}} onClick={() => setConfirmDelete(c.id)}>Delete</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <div style={{padding:"28px",textAlign:"center",color:"var(--text3)",fontSize:14}}>No cycles found</div>}
            </div>
          ) : (
            <div className="at-list">
              {filteredBookings.map(b => (
                <div key={b.id} className="at-row at-row-click" onClick={() => setSelectedBooking(b)}>
                  <div className="at-info">
                    <div className="at-name">#{b.id} · {b.cycle?.model} <span style={{fontSize:11,color:"var(--text3)"}}>Cycle #{b.cycleId}</span></div>
                    <div className="at-meta">👤 {b.user?.name} · 🏪 {b.cycle?.shopkeeper?.name} · ₹{b.totalAmount?.toFixed(2)}</div>
                  </div>
                  <div className="at-actions">
                    <span className={`badge ${STATUS_COLOR[b.status]||"badge-gray"}`}>{b.status}</span>
                    <span className="at-meta">{new Date(b.startTime).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
                    <span style={{fontSize:12,color:"var(--text3)"}}>View →</span>
                  </div>
                </div>
              ))}
              {filteredBookings.length === 0 && <div style={{padding:"28px",textAlign:"center",color:"var(--text3)",fontSize:14}}>No bookings</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
