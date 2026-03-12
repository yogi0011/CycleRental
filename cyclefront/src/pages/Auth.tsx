import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Page } from "../App";
import { METRO_CITIES } from "../components/Navbar";
import "./Auth.css";

const API = "http://localhost:5000";
type Mode = "login" | "register" | "forgot" | "reset";

interface Props { setPage: (p: Page) => void; }

export default function Auth({ setPage }: Props) {
  const { setUser } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<"user"|"shopkeeper"|"admin">("user");
  const [form, setForm] = useState({ name:"", email:"", password:"", newPassword:"", location:"", phone:"", address:"", resetToken:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setError(""); setSuccess(""); };

  const submit = async () => {
    reset(); setLoading(true);
    try {
      if (mode === "forgot") {
        const res = await fetch(`${API}/auth/forgot-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: form.email, role }) });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        setSuccess(`Reset token generated! Copy it: ${d.token}`);
        setMode("reset"); up("resetToken", d.token); return;
      }
      if (mode === "reset") {
        const res = await fetch(`${API}/auth/reset-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token: form.resetToken, newPassword: form.newPassword, role }) });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        setSuccess("Password reset! Sign in now."); setMode("login"); return;
      }

      const body: any = { email: form.email, password: form.password, role };
      if (mode === "register") {
        body.name = form.name;
        body.phone = form.phone;
        if (role === "shopkeeper") { body.location = form.location; body.address = form.address; }
      }

      const res = await fetch(`${API}/auth/${mode === "login" ? "login" : "register"}`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (mode === "register") {
        setSuccess("Account created! Sign in now."); setMode("login");
      } else {
        const userData = { ...data.user, token: data.token };
        localStorage.setItem("crUser", JSON.stringify(userData));
        setUser(userData);
        setPage("home");
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="al-logo">
            <div className="brand-mark-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                <path d="M15 6a1 1 0 0 0-1-1h-4l-3 9h10l-2-8z"/><path d="M12 6l2 8"/>
              </svg>
            </div>
            <span>CycleRent</span>
          </div>
          <h2 className="al-heading">Rent a cycle,<br />go anywhere.</h2>
          <p className="al-sub">Hundreds of cycles across major Indian cities. Book in under a minute.</p>
          <div className="al-cities">
            <div className="al-city-label">Available in</div>
            <div className="al-city-list">
              {METRO_CITIES.slice(0,6).map(c => <span key={c} className="al-city">{c}</span>)}
              <span className="al-city al-city-more">+4 more</span>
            </div>
          </div>
          <div className="al-list">
            {["No deposit or paperwork","Transparent hourly pricing","Cancel within 10 minutes","Rate your ride after"].map(t => (
              <div key={t} className="al-item"><div className="al-check">✓</div>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box card fade-up">
          {mode === "login" || mode === "register" ? (
            <div className="auth-tabs">
              <button className={`auth-tab ${mode==="login"?"on":""}`} onClick={() => { setMode("login"); reset(); }}>Sign in</button>
              <button className={`auth-tab ${mode==="register"?"on":""}`} onClick={() => { setMode("register"); reset(); }}>Register</button>
            </div>
          ) : (
            <div className="auth-back" onClick={() => { setMode("login"); reset(); }}>← Back to sign in</div>
          )}

          <div className="auth-form">
            <h3 className="af-title">{{ login:"Welcome back", register:"Create account", forgot:"Reset password", reset:"New password" }[mode]}</h3>

            {(mode === "login" || mode === "register") && (
              <div className="role-row">
                {(["user","shopkeeper","admin"] as const).map(r => (
                  <button key={r} className={`role-btn ${role===r?"on":""}`} onClick={() => setRole(r)}>
                    {r==="user" ? "🧑 Rider" : r==="shopkeeper" ? "🏪 Shop" : "🔧 Admin"}
                  </button>
                ))}
              </div>
            )}

            {mode === "register" && (
              <div className="fg"><label className="fl">Full name</label>
                <input className="input" placeholder="Your name" value={form.name} onChange={e => up("name",e.target.value)} />
              </div>
            )}

            {mode !== "reset" && (
              <div className="fg"><label className="fl">Email</label>
                <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => up("email",e.target.value)} />
              </div>
            )}

            {(mode === "login" || mode === "register") && (
              <div className="fg"><label className="fl">Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => up("password",e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
              </div>
            )}

            {mode === "register" && (
              <div className="fg"><label className="fl">Phone number</label>
                <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => up("phone",e.target.value)} />
              </div>
            )}

            {mode === "register" && role === "shopkeeper" && (
              <>
                <div className="fg"><label className="fl">City</label>
                  <select className="input" value={form.location} onChange={e => up("location",e.target.value)}>
                    <option value="">Select your city</option>
                    {METRO_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg"><label className="fl">Shop address</label>
                  <input className="input" placeholder="Street, area, landmark..." value={form.address} onChange={e => up("address",e.target.value)} />
                </div>
              </>
            )}

            {mode === "reset" && (
              <>
                <div className="fg"><label className="fl">Reset token</label>
                  <input className="input" value={form.resetToken} onChange={e => up("resetToken",e.target.value)} />
                </div>
                <div className="fg"><label className="fl">New password</label>
                  <input className="input" type="password" placeholder="New password" value={form.newPassword} onChange={e => up("newPassword",e.target.value)} />
                </div>
              </>
            )}

            {error && <div className="msg-err">{error}</div>}
            {success && <div className="msg-ok">{success}</div>}

            <button className="btn btn-primary" style={{width:"100%",padding:"12px"}} onClick={submit} disabled={loading}>
              {loading ? "Please wait..." : { login:"Sign in", register:"Create account", forgot:"Get reset token", reset:"Reset password" }[mode]}
            </button>

            {mode === "login" && (
              <p className="auth-switch">Forgot your password? <span onClick={() => { setMode("forgot"); reset(); }}>Reset it</span></p>
            )}
            {(mode === "login" || mode === "register") && (
              <p className="auth-switch">
                {mode === "login" ? "No account? " : "Have an account? "}
                <span onClick={() => { setMode(mode==="login"?"register":"login"); reset(); }}>
                  {mode === "login" ? "Register" : "Sign in"}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
