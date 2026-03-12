import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import PlansTab from "./Plans";

const AVATAR_OPTIONS = ["🏃","🏃‍♀️","🧑‍🦱","👧","👦","🧑","👩","👨","🧒","👶"];
const COLOR_OPTIONS  = ["#FF6B35","#4ECDC4","#FFE66D","#C9A4F0","#A8E6CF","#FF8FA3","#7EC8E3","#FFB347"];
const RUN_TYPES      = ["Easy Run","Tempo","Long Run","Intervals","Walk/Run","Race"];
const JOURNAL_PROMPTS = [
  "What went well on today's run?",
  "What did your body feel like at mile 1 vs the end?",
  "What would you do differently next time?",
  "Rate your mental toughness today (1–10) and why.",
  "What motivated you to get out the door today?",
  "How is your energy level compared to last week?",
];
const NUTRITION = [
  { category: "Pre-Run",       emoji: "⚡", color: "#FF6B35", timing: "1–2 hours before",  foods: ["Banana with almond butter","Oatmeal with berries","Whole grain toast + honey","Greek yogurt + granola"],                         tip: "Focus on easily digestible carbs. Avoid high fat or high fiber foods right before." },
  { category: "During Run",    emoji: "🏃", color: "#4ECDC4", timing: "Runs over 60 min",   foods: ["Energy gels (every 45 min)","Medjool dates","Banana slices","Sports drink (electrolytes)"],                                      tip: "Aim for 30–60g of carbs per hour on longer efforts. Hydrate every 15–20 min." },
  { category: "Post-Run",      emoji: "🔄", color: "#A8E6CF", timing: "Within 30–45 min",   foods: ["Chocolate milk","Eggs + whole grain toast","Protein smoothie","Chicken + sweet potato"],                                          tip: "4:1 carb to protein ratio is ideal. This is your recovery window — don't skip it!" },
  { category: "Daily Fueling", emoji: "🌿", color: "#FFE66D", timing: "All day",             foods: ["Lean proteins (chicken, fish, beans)","Complex carbs (quinoa, brown rice)","Healthy fats (avocado, nuts)","5+ servings of veggies & fruit"], tip: "Runners need ~1.4–1.7g protein per kg body weight. Eat the rainbow for micronutrients." },
];

const readinessColor = { "Go Hard": "#A8E6CF", "Moderate": "#FFE66D", "Easy Day": "#FF6B35", "Rest": "#FF4444" };
const readinessIcon  = { "Go Hard": "🚀", "Moderate": "💪", "Easy Day": "🚶", "Rest": "🛌" };

function getReadiness(sleep, soreness, energy) {
  const score = (sleep / 10) * 35 + ((10 - soreness) / 10) * 30 + (energy / 10) * 35;
  if (score >= 75) return "Go Hard";
  if (score >= 58) return "Moderate";
  if (score >= 42) return "Easy Day";
  return "Rest";
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🏃");
  const [color, setColor] = useState("#FF6B35");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(""); setLoading(true);
    if (mode === "signup") {
      const { data, error: e } = await supabase.auth.signUp({ email, password });
      if (e) { setError(e.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("profiles").insert({ id: data.user.id, name, avatar, color, goal });
        onAuth(data.user);
      }
    } else {
      const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) { setError(e.message); setLoading(false); return; }
      onAuth(data.user);
    }
    setLoading(false);
  }

  const inp = { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 14px", color: "#f0ece4", fontSize: 15, boxSizing: "border-box", fontFamily: "Georgia, serif" };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "linear-gradient(160deg,#080c14 0%,#111827 50%,#0c0a18 100%)", minHeight: "100vh", color: "#f0ece4", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF6B35", textTransform: "uppercase", marginBottom: 6 }}>Family</div>
      <div style={{ fontSize: 32, fontWeight: "bold", marginBottom: 4 }}>Run Together</div>
      <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 36 }}>Your family training app</div>
      <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", marginBottom: 24, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, cursor: "pointer", background: mode === m ? "#FF6B35" : "transparent", color: mode === m ? "#000" : "#f0ece4", fontWeight: mode === m ? "bold" : "normal", fontSize: 14, fontFamily: "Georgia, serif" }}>
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
        {mode === "signup" && (
          <>
            <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>YOUR NAME</div><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Josh" style={inp} /></div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>PICK AN AVATAR</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AVATAR_OPTIONS.map(a => <button key={a} onClick={() => setAvatar(a)} style={{ fontSize: 24, padding: "6px 8px", borderRadius: 10, border: `2px solid ${avatar === a ? "#FF6B35" : "transparent"}`, background: avatar === a ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.06)", cursor: "pointer" }}>{a}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>PICK A COLOR</div>
              <div style={{ display: "flex", gap: 8 }}>
                {COLOR_OPTIONS.map(c => <button key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: `3px solid ${color === c ? "#fff" : "transparent"}`, cursor: "pointer" }} />)}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>YOUR GOAL</div><input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Run a 5K, Half Marathon..." style={inp} /></div>
          </>
        )}
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>EMAIL</div><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inp} /></div>
        <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>PASSWORD</div><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} /></div>
        {error && <div style={{ color: "#FF6B35", fontSize: 13, marginBottom: 14, background: "rgba(255,107,53,0.1)", borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "#FF6B35", border: "none", borderRadius: 12, padding: "14px", color: "#000", fontWeight: "bold", fontSize: 16, cursor: "pointer", fontFamily: "Georgia, serif" }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>
      </div>
    </div>
  );
}

function WeatherWidget() {
  const w = { temp: 48, condition: "Partly Cloudy", wind: 9, humidity: 62, uv: 3, icon: "⛅" };
  const getOutfit = t => {
    if (t < 32) return { tip: "Heavy layers — thermal top, wind pants, gloves & hat", emoji: "🧤" };
    if (t < 45) return { tip: "Long sleeve base + light jacket, gloves recommended",  emoji: "🧥" };
    if (t < 55) return { tip: "Long sleeve shirt + shorts or light running tights",   emoji: "👕" };
    if (t < 65) return { tip: "Short sleeve + shorts — perfect running weather!",     emoji: "😄" };
    if (t < 75) return { tip: "Short sleeve & shorts. Bring water for hydration",     emoji: "☀️" };
    return       { tip: "Minimal clothing. Early morning run recommended.",           emoji: "🥵" };
  };
  const outfit = getOutfit(w.temp);
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(100,160,220,0.14),rgba(60,120,200,0.07))", border: "1px solid rgba(100,160,220,0.28)", borderRadius: 20, padding: 18, marginBottom: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#7EC8E3", textTransform: "uppercase", marginBottom: 12 }}>📍 Today's Weather</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 50 }}>{w.icon}</div>
        <div>
          <div style={{ fontSize: 34, fontWeight: "bold", lineHeight: 1 }}>{w.temp}°F</div>
          <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>{w.condition}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>💨 {w.wind} mph</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>💧 {w.humidity}%</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>☀️ UV {w.uv}</div>
        </div>
      </div>
      <div style={{ background: "rgba(126,200,227,0.1)", border: "1px solid rgba(126,200,227,0.22)", borderRadius: 12, padding: 11, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 20 }}>{outfit.emoji}</div>
        <div>
          <div style={{ fontSize: 10, color: "#7EC8E3", letterSpacing: 1, marginBottom: 3 }}>WHAT TO WEAR</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{outfit.tip}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [runs, setRuns] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [journal, setJournal] = useState([]);
  const [recovery, setRecovery] = useState([]);
  const [showLogRun, setShowLogRun] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [showAddRecovery, setShowAddRecovery] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [expandedNutrition, setExpandedNutrition] = useState(null);
  const [metricView, setMetricView] = useState("weight");
  const [newRun, setNewRun] = useState({ type: "Easy Run", miles: "", time: "", notes: "", date: new Date().toISOString().split("T")[0] });
  const [newMetric, setNewMetric] = useState({ weight: "", rhr: "", notes: "" });
  const [newJournal, setNewJournal] = useState({ run: "", mood: "😄", rating: 7, entry: "", prompt: JOURNAL_PROMPTS[0] });
  const [newRecovery, setNewRecovery] = useState({ sleep: 7, soreness: 3, energy: 7, notes: "" });
  const [editProfile, setEditProfile] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) { loadRuns(); loadMetrics(); loadJournal(); loadRecovery(); } }, [user]);

  async function loadProfile(uid) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data); setLoading(false);
  }
  async function loadRuns() {
    const { data } = await supabase.from("runs").select("*").eq("user_id", user.id).order("date", { ascending: false });
    setRuns(data || []);
  }
  async function loadMetrics() {
    const { data } = await supabase.from("metrics").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    setMetrics(data || []);
  }
  async function loadJournal() {
    const { data } = await supabase.from("journal").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setJournal(data || []);
  }
  async function loadRecovery() {
    const { data } = await supabase.from("recovery").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setRecovery(data || []);
  }
  async function saveRun() {
    await supabase.from("runs").insert({ ...newRun, user_id: user.id, miles: parseFloat(newRun.miles) });
    setNewRun({ type: "Easy Run", miles: "", time: "", notes: "", date: new Date().toISOString().split("T")[0] });
    setShowLogRun(false); loadRuns();
  }
  async function deleteRun(id) {
    await supabase.from("runs").delete().eq("id", id); loadRuns();
  }
  async function saveMetric() {
    await supabase.from("metrics").insert({ ...newMetric, user_id: user.id, weight: parseFloat(newMetric.weight), rhr: parseInt(newMetric.rhr), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    setNewMetric({ weight: "", rhr: "", notes: "" }); setShowAddMetric(false); loadMetrics();
  }
  async function saveJournal() {
    await supabase.from("journal").insert({ ...newJournal, user_id: user.id, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    setNewJournal({ run: "", mood: "😄", rating: 7, entry: "", prompt: JOURNAL_PROMPTS[0] }); setShowAddJournal(false); loadJournal();
  }
  async function saveRecovery() {
    const readiness = getReadiness(newRecovery.sleep, newRecovery.soreness, newRecovery.energy);
    await supabase.from("recovery").insert({ ...newRecovery, readiness, user_id: user.id, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    setNewRecovery({ sleep: 7, soreness: 3, energy: 7, notes: "" }); setShowAddRecovery(false); loadRecovery();
  }
  async function saveProfile() {
    await supabase.from("profiles").update(editProfile).eq("id", user.id);
    setProfile({ ...profile, ...editProfile }); setShowEditProfile(false);
  }
  async function signOut() { await supabase.auth.signOut(); }

  if (loading) return (
    <div style={{ fontFamily: "Georgia, serif", background: "#080c14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#f0ece4" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 16 }}>🏃</div><div style={{ fontSize: 14, opacity: 0.5 }}>Loading...</div></div>
    </div>
  );

  if (!user || !profile) return <AuthScreen onAuth={u => { setUser(u); loadProfile(u.id); }} />;

  const color = profile.color || "#FF6B35";
  const totalMiles = runs.reduce((s, r) => s + (r.miles || 0), 0);
  const latestRecovery = recovery[0];
  const latestMetric = metrics[metrics.length - 1];
  const prevMetric = metrics[metrics.length - 2];

  const tabs = [
    { id: "dashboard", label: "Home",      emoji: "🏠" },
    { id: "training",  label: "Training",  emoji: "📅" },
    { id: "recovery",  label: "Recovery",  emoji: "🛌" },
    { id: "metrics",   label: "Metrics",   emoji: "📈" },
    { id: "journal",   label: "Journal",   emoji: "📖" },
    { id: "nutrition", label: "Nutrition", emoji: "🥗" },
    { id: "plans",     label: "Plans",     emoji: "📋" },
    { id: "profile",   label: "Profile",   emoji: "👤" },
  ];

  const inp = { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box", fontFamily: "Georgia, serif" };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "linear-gradient(160deg,#080c14 0%,#111827 50%,#0c0a18 100%)", minHeight: "100vh", color: "#f0ece4", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse at 15% 15%,${color}11 0%,transparent 55%)` }} />

      {/* Header */}
      <div style={{ padding: "20px 18px 13px", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,12,20,0.85)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color, textTransform: "uppercase", marginBottom: 3 }}>Family</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>Run Together</div>
          </div>
          <div style={{ background: `${color}18`, border: `1px solid ${color}33`, borderRadius: 12, padding: "7px 13px", fontSize: 13 }}>{profile.avatar} {profile.name}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 78, zIndex: 9, overflowX: "auto", background: "rgba(8,12,20,0.75)", backdropFilter: "blur(8px)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flexShrink: 0, minWidth: 68, padding: "9px 5px", border: "none", background: "transparent", cursor: "pointer", color: activeTab === tab.id ? color : "rgba(240,236,228,0.42)", borderBottom: `2px solid ${activeTab === tab.id ? color : "transparent"}`, fontSize: 10, transition: "all 0.2s" }}>
            <div style={{ fontSize: 16 }}>{tab.emoji}</div>
            <div style={{ marginTop: 2 }}>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 18px 70px", position: "relative", zIndex: 1 }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <WeatherWidget />
            <div style={{ background: `linear-gradient(135deg,${color}1e,${color}08)`, border: `1px solid ${color}30`, borderRadius: 20, padding: 18, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 40 }}>{profile.avatar}</div>
                  <div style={{ fontSize: 22, fontWeight: "bold", marginTop: 6 }}>{profile.name}</div>
                  <div style={{ fontSize: 13, color, marginTop: 2 }}>🎯 {profile.goal || "Set a goal in Profile!"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ background: `${color}25`, borderRadius: 12, padding: "5px 11px", marginBottom: 7, fontSize: 13 }}>🏃 {totalMiles.toFixed(1)} total mi</div>
                  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "5px 11px", fontSize: 13 }}>📊 {runs.length} runs</div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[
                { label: "Total miles",      value: totalMiles.toFixed(1),                               emoji: "🗺️" },
                { label: "Runs logged",       value: runs.length,                                         emoji: "📊" },
                { label: "Latest weight",     value: latestMetric ? `${latestMetric.weight} lbs` : "—",  emoji: "⚖️" },
                { label: "Today's readiness", value: latestRecovery ? latestRecovery.readiness : "—",    emoji: "🛌" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 13 }}>
                  <div style={{ fontSize: 20 }}>{s.emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 5 }}>{s.value}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {latestRecovery && (
              <div style={{ background: `${readinessColor[latestRecovery.readiness]}10`, border: `1px solid ${readinessColor[latestRecovery.readiness]}30`, borderRadius: 16, padding: 15, marginBottom: 18, textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, opacity: 0.55, textTransform: "uppercase", marginBottom: 6 }}>Today's Readiness</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: readinessColor[latestRecovery.readiness] }}>{readinessIcon[latestRecovery.readiness]} {latestRecovery.readiness}</div>
              </div>
            )}
            <div style={{ background: "linear-gradient(135deg,rgba(78,205,196,0.12),rgba(78,205,196,0.04))", border: "1px solid rgba(78,205,196,0.22)", borderRadius: 16, padding: 15 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#4ECDC4", textTransform: "uppercase", marginBottom: 8 }}>Coach's Tip</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.88 }}>"Consistency beats intensity every time. A 30-minute easy run today is worth more than skipping because you can't do a hard workout. Just get out there!"</div>
            </div>
          </div>
        )}

        {/* TRAINING */}
        {activeTab === "training" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Training Log</div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>Your Runs</div>
              </div>
              <button onClick={() => setShowLogRun(!showLogRun)} style={{ background: color, border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Log Run</button>
            </div>
            {showLogRun && (
              <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${color}44`, borderRadius: 16, padding: 18, marginBottom: 18 }}>
                <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>Log a Run 🏃</div>
                {[
                  { label: "DATE",             el: <input type="date" value={newRun.date} onChange={e => setNewRun({ ...newRun, date: e.target.value })} style={inp} /> },
                  { label: "RUN TYPE",         el: <select value={newRun.type} onChange={e => setNewRun({ ...newRun, type: e.target.value })} style={inp}>{RUN_TYPES.map(t => <option key={t}>{t}</option>)}</select> },
                  { label: "DISTANCE (miles)", el: <input type="number" placeholder="e.g. 3.1" value={newRun.miles} onChange={e => setNewRun({ ...newRun, miles: e.target.value })} style={inp} /> },
                  { label: "TIME",             el: <input placeholder="e.g. 28:45" value={newRun.time} onChange={e => setNewRun({ ...newRun, time: e.target.value })} style={inp} /> },
                  { label: "NOTES",            el: <input placeholder="How did it feel?" value={newRun.notes} onChange={e => setNewRun({ ...newRun, notes: e.target.value })} style={inp} /> },
                ].map((f, i) => <div key={i} style={{ marginBottom: 10 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>{f.label}</div>{f.el}</div>)}
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button onClick={() => setShowLogRun(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveRun} style={{ flex: 2, background: color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save Run ✓</button>
                </div>
              </div>
            )}
            {runs.length === 0
              ? <div style={{ textAlign: "center", padding: 40, opacity: 0.45, border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 16 }}>No runs yet. Log your first run! 👟</div>
              : runs.map(run => (
                <div key={run.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${color}`, borderRadius: 16, padding: 15, marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 15 }}>{run.type}</div>
                      <div style={{ fontSize: 11, opacity: 0.42, marginTop: 2 }}>{run.date}</div>
                      {run.notes && <div style={{ fontSize: 12, opacity: 0.62, marginTop: 5, fontStyle: "italic" }}>"{run.notes}"</div>}
                    </div>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <div style={{ color, fontWeight: "bold", fontSize: 18 }}>{run.miles} mi</div>
                      <div style={{ fontSize: 12, opacity: 0.5 }}>⏱ {run.time}</div>
                      <button onClick={() => deleteRun(run.id)} style={{ fontSize: 11, background: "rgba(255,100,100,0.15)", border: "none", borderRadius: 6, padding: "3px 8px", color: "#FF6B6B", cursor: "pointer" }}>delete</button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* RECOVERY */}
        {activeTab === "recovery" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Recovery</div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>Your Readiness</div>
              </div>
              <button onClick={() => setShowAddRecovery(!showAddRecovery)} style={{ background: color, border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Check In</button>
            </div>
            {latestRecovery && !showAddRecovery && (
              <div style={{ background: `${readinessColor[latestRecovery.readiness]}12`, border: `1px solid ${readinessColor[latestRecovery.readiness]}35`, borderRadius: 20, padding: 20, marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, opacity: 0.55, textTransform: "uppercase", marginBottom: 8 }}>Today's Readiness</div>
                <div style={{ fontSize: 28, fontWeight: "bold", color: readinessColor[latestRecovery.readiness], marginBottom: 4 }}>{readinessIcon[latestRecovery.readiness]} {latestRecovery.readiness}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14, fontSize: 13 }}>
                  <span>😴 {latestRecovery.sleep}h</span><span>💢 {latestRecovery.soreness}/10</span><span>⚡ {latestRecovery.energy}/10</span>
                </div>
              </div>
            )}
            {showAddRecovery && (
              <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${color}44`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>🛌 Morning Check-In</div>
                {[
                  { label: "Sleep (hours)", key: "sleep", min: 1, max: 12, c: "#7EC8E3", emoji: "😴", suffix: "h" },
                  { label: "Soreness (0=none, 10=very sore)", key: "soreness", min: 0, max: 10, c: "#FF6B35", emoji: "💢", suffix: "/10" },
                  { label: "Energy Level", key: "energy", min: 0, max: 10, c: "#FFE66D", emoji: "⚡", suffix: "/10" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span>{f.emoji} {f.label}</span>
                      <span style={{ color: f.c, fontWeight: "bold" }}>{newRecovery[f.key]}{f.suffix}</span>
                    </div>
                    <input type="range" min={f.min} max={f.max} value={newRecovery[f.key]} onChange={e => setNewRecovery({ ...newRecovery, [f.key]: Number(e.target.value) })} style={{ width: "100%", accentColor: f.c }} />
                  </div>
                ))}
                <div style={{ background: `${readinessColor[getReadiness(newRecovery.sleep, newRecovery.soreness, newRecovery.energy)]}12`, border: `1px solid ${readinessColor[getReadiness(newRecovery.sleep, newRecovery.soreness, newRecovery.energy)]}35`, borderRadius: 12, padding: 12, marginBottom: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 10, opacity: 0.55, marginBottom: 4 }}>YOUR READINESS</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: readinessColor[getReadiness(newRecovery.sleep, newRecovery.soreness, newRecovery.energy)] }}>
                    {readinessIcon[getReadiness(newRecovery.sleep, newRecovery.soreness, newRecovery.energy)]} {getReadiness(newRecovery.sleep, newRecovery.soreness, newRecovery.energy)}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>NOTES</div><input value={newRecovery.notes} onChange={e => setNewRecovery({ ...newRecovery, notes: e.target.value })} placeholder="How do you feel?" style={inp} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowAddRecovery(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveRecovery} style={{ flex: 2, background: color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save ✓</button>
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>History</div>
            {recovery.length === 0
              ? <div style={{ textAlign: "center", padding: 30, opacity: 0.45, border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 16 }}>No check-ins yet!</div>
              : recovery.map((e, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${readinessColor[e.readiness]}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13, fontWeight: "bold" }}>{e.date}</div>
                    <div style={{ fontSize: 11, padding: "3px 9px", borderRadius: 8, fontWeight: "bold", background: `${readinessColor[e.readiness]}18`, color: readinessColor[e.readiness] }}>{e.readiness}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 7, fontSize: 12, opacity: 0.65 }}>
                    <span>😴 {e.sleep}h</span><span>💢 {e.soreness}/10</span><span>⚡ {e.energy}/10</span>
                  </div>
                  {e.notes && <div style={{ fontSize: 12, opacity: 0.5, marginTop: 5, fontStyle: "italic" }}>"{e.notes}"</div>}
                </div>
              ))
            }
          </div>
        )}

        {/* METRICS */}
        {activeTab === "metrics" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Body Metrics</div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>Your Trends</div>
              </div>
              <button onClick={() => setShowAddMetric(!showAddMetric)} style={{ background: color, border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Log</button>
            </div>
            {showAddMetric && (
              <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${color}44`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>Log Metrics</div>
                {[{ label: "Weight (lbs)", key: "weight", placeholder: "e.g. 178" }, { label: "Resting Heart Rate (bpm)", key: "rhr", placeholder: "e.g. 52" }, { label: "Notes", key: "notes", placeholder: "How are you feeling?" }].map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>{f.label}</div><input placeholder={f.placeholder} value={newMetric[f.key]} onChange={e => setNewMetric({ ...newMetric, [f.key]: e.target.value })} style={inp} /></div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => setShowAddMetric(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveMetric} style={{ flex: 2, background: color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save ✓</button>
                </div>
              </div>
            )}
            {latestMetric && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Current Weight", value: `${latestMetric.weight} lbs`, delta: prevMetric ? (latestMetric.weight - prevMetric.weight).toFixed(1) : null, unit: "lbs", emoji: "⚖️" },
                  { label: "Resting HR",     value: `${latestMetric.rhr} bpm`,    delta: prevMetric ? (latestMetric.rhr - prevMetric.rhr) : null, unit: "bpm", emoji: "❤️" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}28`, borderRadius: 14, padding: 14 }}>
                    <div style={{ fontSize: 22 }}>{s.emoji}</div>
                    <div style={{ fontSize: 22, fontWeight: "bold", marginTop: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{s.label}</div>
                    {s.delta !== null && <div style={{ fontSize: 11, marginTop: 6, color: Number(s.delta) < 0 ? "#A8E6CF" : "#FF6B35", fontWeight: "bold" }}>{Number(s.delta) > 0 ? "▲" : "▼"} {Math.abs(s.delta)} {s.unit}</div>}
                  </div>
                ))}
              </div>
            )}
            {metrics.length > 1 && (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[{ key: "weight", label: "Weight" }, { key: "rhr", label: "Heart Rate" }].map(t => (
                    <button key={t.key} onClick={() => setMetricView(t.key)} style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, background: metricView === t.key ? color : "rgba(255,255,255,0.07)", color: metricView === t.key ? "#000" : "#f0ece4", fontWeight: metricView === t.key ? "bold" : "normal" }}>{t.label}</button>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                  <svg viewBox="0 0 300 120" style={{ width: "100%", overflow: "visible" }}>
                    <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
                    {(() => {
                      const vals = metrics.map(d => metricView === "weight" ? d.weight : d.rhr);
                      const min = Math.min(...vals) - 2, max = Math.max(...vals) + 2;
                      const pts = metrics.map((d, i) => ({ x: (i / (metrics.length - 1)) * 260 + 20, y: 10 + 80 - ((vals[i] - min) / (max - min)) * 80, val: vals[i], date: d.date }));
                      const poly = pts.map(p => `${p.x},${p.y}`).join(" ");
                      return (<>
                        {[20,55,90].map(y => <line key={y} x1="10" y1={y} x2="290" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
                        <polygon points={`${pts[0].x},110 ${poly} ${pts[pts.length-1].x},110`} fill="url(#mg)" />
                        <polyline points={poly} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                        {pts.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="4" fill={color} /><text x={p.x} y={p.y-10} textAnchor="middle" fill="#f0ece4" fontSize="9" fontWeight="bold">{p.val}</text><text x={p.x} y={115} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">{(p.date||"").split(" ")[1]||""}</text></g>)}
                      </>);
                    })()}
                  </svg>
                </div>
              </>
            )}
            <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>History</div>
            {metrics.length === 0
              ? <div style={{ textAlign: "center", padding: 30, opacity: 0.45, border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 16 }}>No metrics yet!</div>
              : [...metrics].reverse().map((m, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${color}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13, fontWeight: "bold" }}>{m.date}</div>
                    <div style={{ display: "flex", gap: 14 }}><span style={{ fontSize: 13 }}>⚖️ {m.weight} lbs</span><span style={{ fontSize: 13 }}>❤️ {m.rhr} bpm</span></div>
                  </div>
                  {m.notes && <div style={{ fontSize: 12, opacity: 0.55, marginTop: 6, fontStyle: "italic" }}>"{m.notes}"</div>}
                </div>
              ))
            }
          </div>
        )}

        {/* JOURNAL */}
        {activeTab === "journal" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Run Journal</div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>Your Reflections</div>
              </div>
              <button onClick={() => setShowAddJournal(!showAddJournal)} style={{ background: color, border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Write</button>
            </div>
            {showAddJournal && (
              <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${color}44`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>📝 New Entry</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>PROMPT</div>
                  <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4 }}>
                    {JOURNAL_PROMPTS.map((p, i) => <button key={i} onClick={() => setNewJournal({ ...newJournal, prompt: p })} style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, background: newJournal.prompt === p ? color : "rgba(255,255,255,0.07)", color: newJournal.prompt === p ? "#000" : "#f0ece4" }}>P{i+1}</button>)}
                  </div>
                  <div style={{ background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 10, padding: 10, marginTop: 8, fontSize: 13, fontStyle: "italic", color }}>"{newJournal.prompt}"</div>
                </div>
                <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>RUN</div><input value={newJournal.run} onChange={e => setNewJournal({ ...newJournal, run: e.target.value })} placeholder="Easy 4mi" style={inp} /></div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>MOOD</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["😩","😕","🙂","😄","💪","🔥"].map(m => <button key={m} onClick={() => setNewJournal({ ...newJournal, mood: m })} style={{ fontSize: 22, background: newJournal.mood === m ? `${color}28` : "rgba(255,255,255,0.06)", border: `2px solid ${newJournal.mood === m ? color : "transparent"}`, borderRadius: 10, padding: "4px 7px", cursor: "pointer" }}>{m}</button>)}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.55, marginBottom: 5 }}><span>EFFORT</span><span style={{ color, fontWeight: "bold" }}>{newJournal.rating}/10</span></div>
                  <input type="range" min="1" max="10" value={newJournal.rating} onChange={e => setNewJournal({ ...newJournal, rating: Number(e.target.value) })} style={{ width: "100%", accentColor: color }} />
                </div>
                <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>REFLECTION</div><textarea value={newJournal.entry} onChange={e => setNewJournal({ ...newJournal, entry: e.target.value })} placeholder="Write freely..." rows={4} style={{ ...inp, resize: "none" }} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowAddJournal(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveJournal} style={{ flex: 2, background: color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save Entry ✓</button>
                </div>
              </div>
            )}
            {journal.length === 0
              ? <div style={{ textAlign: "center", padding: 40, opacity: 0.45, border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 16 }}><div style={{ fontSize: 30, marginBottom: 10 }}>📖</div>No entries yet!</div>
              : journal.map((e, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}18`, borderLeft: `3px solid ${color}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color, letterSpacing: 1 }}>{e.date} — {e.run}</div>
                      <div style={{ fontStyle: "italic", fontSize: 11, opacity: 0.45, marginTop: 3 }}>"{e.prompt}"</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ fontSize: 22 }}>{e.mood}</div>
                      <div style={{ background: `${color}18`, color, borderRadius: 8, padding: "3px 8px", fontSize: 12, fontWeight: "bold" }}>{e.rating}/10</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.85 }}>{e.entry}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* NUTRITION */}
        {activeTab === "nutrition" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Runner's Kitchen</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>Fuel Your Training</div>
            </div>
            {NUTRITION.map((n, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${n.color}25`, borderRadius: 16, marginBottom: 11, overflow: "hidden" }}>
                <div onClick={() => setExpandedNutrition(expandedNutrition === i ? null : i)} style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, cursor: "pointer" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", background: `${n.color}16` }}>{n.emoji}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: "bold", fontSize: 14 }}>{n.category}</div><div style={{ fontSize: 11, color: n.color, marginTop: 2 }}>⏰ {n.timing}</div></div>
                  <div style={{ opacity: 0.32, fontSize: 15 }}>{expandedNutrition === i ? "▲" : "▼"}</div>
                </div>
                {expandedNutrition === i && (
                  <div style={{ padding: "0 15px 15px", borderTop: `1px solid ${n.color}15` }}>
                    <div style={{ paddingTop: 12 }}>
                      {n.foods.map((f, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: j < n.foods.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: n.color, flexShrink: 0 }} /><div style={{ fontSize: 13 }}>{f}</div></div>)}
                      <div style={{ marginTop: 12, background: `${n.color}10`, borderRadius: 10, padding: 11, fontSize: 12, lineHeight: 1.6, borderLeft: `3px solid ${n.color}` }}>💡 {n.tip}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PLANS — now uses the PlansTab component */}
        {activeTab === "plans" && (
          <PlansTab color={color} userId={user.id} onPlanActivated={loadRuns} />
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Account</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>Your Profile</div>
            </div>
            {!showEditProfile ? (
              <div style={{ background: `linear-gradient(135deg,${color}1e,${color}08)`, border: `1px solid ${color}30`, borderRadius: 20, padding: 20, marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 60, marginBottom: 10 }}>{profile.avatar}</div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>{profile.name}</div>
                <div style={{ fontSize: 13, color, marginTop: 6 }}>🎯 {profile.goal || "No goal set yet"}</div>
                <div style={{ fontSize: 12, opacity: 0.45, marginTop: 6 }}>{user.email}</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: color }} />
                  <div style={{ fontSize: 12, opacity: 0.55 }}>Your color</div>
                </div>
                <button onClick={() => { setEditProfile({ name: profile.name, avatar: profile.avatar, color: profile.color, goal: profile.goal }); setShowEditProfile(true); }} style={{ marginTop: 16, background: color, border: "none", borderRadius: 12, padding: "10px 24px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 14 }}>Edit Profile</button>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${color}44`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>Edit Profile</div>
                <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>NAME</div><input value={editProfile.name || ""} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} style={inp} /></div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>AVATAR</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {AVATAR_OPTIONS.map(a => <button key={a} onClick={() => setEditProfile({ ...editProfile, avatar: a })} style={{ fontSize: 24, padding: "6px 8px", borderRadius: 10, border: `2px solid ${editProfile.avatar === a ? color : "transparent"}`, background: editProfile.avatar === a ? `${color}20` : "rgba(255,255,255,0.06)", cursor: "pointer" }}>{a}</button>)}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>COLOR</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {COLOR_OPTIONS.map(c => <button key={c} onClick={() => setEditProfile({ ...editProfile, color: c })} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: `3px solid ${editProfile.color === c ? "#fff" : "transparent"}`, cursor: "pointer" }} />)}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>GOAL</div><input value={editProfile.goal || ""} onChange={e => setEditProfile({ ...editProfile, goal: e.target.value })} placeholder="e.g. Run a Half Marathon" style={inp} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveProfile} style={{ flex: 2, background: color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save Changes ✓</button>
                </div>
              </div>
            )}
            <button onClick={signOut} style={{ width: "100%", background: "rgba(255,100,100,0.12)", border: "1px solid rgba(255,100,100,0.25)", borderRadius: 12, padding: 14, color: "#FF6B6B", fontWeight: "bold", cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>Sign Out</button>
          </div>
        )}

      </div>
    </div>
  );
}