import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const FAMILY_MEMBERS = [
  { id: 1, name: "Dad",  avatar: "🏃",    color: "#FF6B35", goal: "Half Marathon",  weeklyMiles: 18, streak: 12 },
  { id: 2, name: "Mom",  avatar: "🏃‍♀️",  color: "#4ECDC4", goal: "5K PR",          weeklyMiles: 14, streak: 8  },
  { id: 3, name: "Alex", avatar: "🧑‍🦱", color: "#FFE66D", goal: "First 5K",        weeklyMiles: 9,  streak: 5  },
  { id: 4, name: "Sam",  avatar: "👧",     color: "#C9A4F0", goal: "Active 3x/week", weeklyMiles: 6,  streak: 3  },
];

const RUNS = [
  { id: 1, memberId: 1, date: "2026-03-11", type: "Easy Run", miles: 5,   time: "48:00",   notes: "Felt great!" },
  { id: 2, memberId: 2, date: "2026-03-11", type: "Tempo",    miles: 3,   time: "25:30",   notes: "Pushed hard" },
  { id: 3, memberId: 1, date: "2026-03-09", type: "Long Run", miles: 10,  time: "1:38:00", notes: "New route!" },
  { id: 4, memberId: 3, date: "2026-03-10", type: "Easy Run", miles: 2,   time: "22:00",   notes: "First run this week" },
  { id: 5, memberId: 4, date: "2026-03-08", type: "Walk/Run", miles: 1.5, time: "20:00",   notes: "" },
  { id: 6, memberId: 2, date: "2026-03-08", type: "Easy Run", miles: 4,   time: "38:00",   notes: "" },
];

const NUTRITION = [
  { category: "Pre-Run",       emoji: "⚡", color: "#FF6B35", timing: "1–2 hours before",  foods: ["Banana with almond butter","Oatmeal with berries","Whole grain toast + honey","Greek yogurt + granola"],                         tip: "Focus on easily digestible carbs. Avoid high fat or high fiber foods right before." },
  { category: "During Run",    emoji: "🏃", color: "#4ECDC4", timing: "Runs over 60 min",   foods: ["Energy gels (every 45 min)","Medjool dates","Banana slices","Sports drink (electrolytes)"],                                      tip: "Aim for 30–60g of carbs per hour on longer efforts. Hydrate every 15–20 min." },
  { category: "Post-Run",      emoji: "🔄", color: "#A8E6CF", timing: "Within 30–45 min",   foods: ["Chocolate milk","Eggs + whole grain toast","Protein smoothie","Chicken + sweet potato"],                                          tip: "4:1 carb to protein ratio is ideal. This is your recovery window — don't skip it!" },
  { category: "Daily Fueling", emoji: "🌿", color: "#FFE66D", timing: "All day",             foods: ["Lean proteins (chicken, fish, beans)","Complex carbs (quinoa, brown rice)","Healthy fats (avocado, nuts)","5+ servings of veggies & fruit"], tip: "Runners need ~1.4–1.7g protein per kg body weight. Eat the rainbow for micronutrients." },
];

const WORKOUT_PLANS = [
  { name: "Couch to 5K",        weeks: 9,  level: "Beginner",    emoji: "🌱", desc: "Run your first 5K from scratch with walk/run intervals" },
  { name: "5K Speed Builder",   weeks: 6,  level: "Intermediate", emoji: "⚡", desc: "Break your personal record with tempo runs & intervals" },
  { name: "10K Foundation",     weeks: 10, level: "Intermediate", emoji: "🔥", desc: "Build endurance to comfortably race 10K" },
  { name: "Half Marathon Prep", weeks: 14, level: "Advanced",     emoji: "🏅", desc: "Full structured training for your half marathon goal" },
];

const CHALLENGES = [
  { id: 1, title: "Weekly Mileage Battle", desc: "Who logs the most miles this week?",  emoji: "🗺️", active: true  },
  { id: 2, title: "Streak Champion",       desc: "Most consecutive days with a run",    emoji: "🔥", active: true  },
  { id: 3, title: "Early Bird Club",       desc: "3 runs before 7am this month",        emoji: "🌅", active: false },
];

const BODY_METRICS_SEED = {
  1: [
    { date: "Mar 1",  weight: 182, rhr: 52, notes: "Feeling strong" },
    { date: "Mar 4",  weight: 181, rhr: 51, notes: "" },
    { date: "Mar 7",  weight: 180, rhr: 50, notes: "Hydrated well" },
    { date: "Mar 10", weight: 179, rhr: 49, notes: "Best sleep in weeks" },
  ],
  2: [
    { date: "Mar 1",  weight: 138, rhr: 58, notes: "" },
    { date: "Mar 5",  weight: 137, rhr: 57, notes: "Yoga + run combo" },
    { date: "Mar 9",  weight: 137, rhr: 56, notes: "Feeling lean" },
  ],
  3: [
    { date: "Mar 2",  weight: 145, rhr: 65, notes: "Starting fresh" },
    { date: "Mar 8",  weight: 144, rhr: 63, notes: "More energy!" },
  ],
  4: [
    { date: "Mar 3",  weight: 112, rhr: 72, notes: "First check-in" },
    { date: "Mar 10", weight: 111, rhr: 70, notes: "Sleeping better" },
  ],
};

const JOURNAL_PROMPTS = [
  "What went well on today's run?",
  "What did your body feel like at mile 1 vs the end?",
  "What would you do differently next time?",
  "Rate your mental toughness today (1–10) and why.",
  "What motivated you to get out the door today?",
  "How is your energy level compared to last week?",
];

const JOURNAL_SEED = {
  1: [
    { date: "Mar 11", run: "Easy 5mi", mood: "😄", rating: 8, entry: "Legs felt springy from the start. Hit a great rhythm around mile 2. The new riverside route is a game-changer — will definitely add it to the rotation.", prompt: "What went well on today's run?" },
    { date: "Mar 9",  run: "Long 10mi", mood: "💪", rating: 9, entry: "Mentally this was my best long run yet. Kept reminding myself to slow down early and it paid off. Finished feeling like I had more in the tank.", prompt: "Rate your mental toughness today (1–10) and why." },
  ],
  2: [{ date: "Mar 11", run: "Tempo 3mi", mood: "🔥", rating: 7, entry: "Hard session today. The last mile was brutal but I didn't walk. That's the win.", prompt: "What motivated you to get out the door today?" }],
  3: [{ date: "Mar 10", run: "Easy 2mi", mood: "🙂", rating: 6, entry: "Still getting used to breathing while running. Made it the whole way without stopping though!", prompt: "What did your body feel like at mile 1 vs the end?" }],
  4: [],
};

const RECOVERY_SEED = {
  1: [
    { date: "Mar 11", sleep: 7,  soreness: 3, energy: 8, readiness: "Go Hard",  notes: "Legs feel fresh after yesterday's rest" },
    { date: "Mar 10", sleep: 8,  soreness: 2, energy: 9, readiness: "Go Hard",  notes: "" },
    { date: "Mar 9",  sleep: 6,  soreness: 6, energy: 5, readiness: "Easy Day", notes: "Tight hamstrings — need to stretch more" },
  ],
  2: [
    { date: "Mar 11", sleep: 8,  soreness: 4, energy: 7, readiness: "Moderate", notes: "" },
    { date: "Mar 10", sleep: 7,  soreness: 5, energy: 6, readiness: "Easy Day", notes: "Calves sore from tempo" },
  ],
  3: [{ date: "Mar 10", sleep: 9,  soreness: 2, energy: 8, readiness: "Go Hard",  notes: "Feeling great!" }],
  4: [{ date: "Mar 11", sleep: 10, soreness: 1, energy: 9, readiness: "Go Hard",  notes: "Best sleep ever" }],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const readinessColor = { "Go Hard": "#A8E6CF", "Moderate": "#FFE66D", "Easy Day": "#FF6B35", "Rest": "#FF4444" };
const readinessIcon  = { "Go Hard": "🚀", "Moderate": "💪", "Easy Day": "🚶", "Rest": "🛌" };

function getReadiness(sleep, soreness, energy) {
  const score = (sleep / 10) * 35 + ((10 - soreness) / 10) * 30 + (energy / 10) * 35;
  if (score >= 75) return "Go Hard";
  if (score >= 58) return "Moderate";
  if (score >= 42) return "Easy Day";
  return "Rest";
}

// ─── WEATHER WIDGET ──────────────────────────────────────────────────────────

function WeatherWidget() {
  const weather = { temp: 48, condition: "Partly Cloudy", wind: 9, humidity: 62, uv: 3, icon: "⛅" };
  function getOutfit(t) {
    if (t < 32) return { tip: "Heavy layers — thermal top, wind pants, gloves & hat",         emoji: "🧤" };
    if (t < 45) return { tip: "Long sleeve base + light jacket, gloves recommended",           emoji: "🧥" };
    if (t < 55) return { tip: "Long sleeve shirt + shorts or light running tights",            emoji: "👕" };
    if (t < 65) return { tip: "Short sleeve + capris or shorts — perfect running weather!",    emoji: "😄" };
    if (t < 75) return { tip: "Short sleeve & shorts. Bring water for hydration",              emoji: "☀️" };
    return       { tip: "Minimal clothing. Early morning run recommended. Hydrate extra!",     emoji: "🥵" };
  }
  const outfit = getOutfit(weather.temp);
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(100,160,220,0.14),rgba(60,120,200,0.07))", border: "1px solid rgba(100,160,220,0.28)", borderRadius: 20, padding: 18, marginBottom: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#7EC8E3", textTransform: "uppercase", marginBottom: 12 }}>📍 Today's Weather — Salt Lake City</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 50 }}>{weather.icon}</div>
        <div>
          <div style={{ fontSize: 34, fontWeight: "bold", lineHeight: 1 }}>{weather.temp}°F</div>
          <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>{weather.condition}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>💨 {weather.wind} mph</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>💧 {weather.humidity}%</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>☀️ UV {weather.uv}</div>
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

// ─── BODY METRICS ─────────────────────────────────────────────────────────────

function BodyMetricsTab({ member }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ weight: "", rhr: "", notes: "" });
  const [metric, setMetric] = useState("weight");
  const data = BODY_METRICS_SEED[member.id] || [];
  const latest = data[data.length - 1];
  const prev   = data[data.length - 2];
  const wDelta = latest && prev ? (latest.weight - prev.weight).toFixed(1) : null;
  const rDelta = latest && prev ? (latest.rhr - prev.rhr) : null;
  const minW = data.length ? Math.min(...data.map(d => d.weight)) - 2 : 0;
  const maxW = data.length ? Math.max(...data.map(d => d.weight)) + 2 : 1;
  const minR = data.length ? Math.min(...data.map(d => d.rhr)) - 2 : 0;
  const maxR = data.length ? Math.max(...data.map(d => d.rhr)) + 2 : 1;
  const cd = data.map((d, i) => ({
    ...d,
    wY: 10 + 80 - ((d.weight - minW) / (maxW - minW)) * 80,
    rY: 10 + 80 - ((d.rhr   - minR) / (maxR - minR)) * 80,
    x: data.length > 1 ? (i / (data.length - 1)) * 260 + 20 : 150,
  }));
  const pts = (key) => cd.map(d => `${d.x},${d[key]}`).join(" ");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Body Metrics</div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{member.name}'s Trends</div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: member.color, border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Log</button>
      </div>

      {showAdd && (
        <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${member.color}44`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>Log Today's Metrics</div>
          {[{ label: "Weight (lbs)", key: "weight", placeholder: "e.g. 178" }, { label: "Resting Heart Rate (bpm)", key: "rhr", placeholder: "e.g. 52" }, { label: "Notes", key: "notes", placeholder: "How are you feeling?" }].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>{f.label}</div>
              <input placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => setShowAdd(false)} style={{ flex: 2, background: member.color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save ✓</button>
          </div>
        </div>
      )}

      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Current Weight", value: `${latest.weight} lbs`, delta: wDelta, unit: "lbs", emoji: "⚖️", better: "down" },
            { label: "Resting HR",     value: `${latest.rhr} bpm`,    delta: rDelta, unit: "bpm", emoji: "❤️", better: "down" },
          ].map((s, i) => {
            const improved = Number(s.delta) < 0;
            return (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${member.color}28`, borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 22 }}>{s.emoji}</div>
                <div style={{ fontSize: 22, fontWeight: "bold", marginTop: 6 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{s.label}</div>
                {s.delta !== null && (
                  <div style={{ fontSize: 11, marginTop: 6, color: improved ? "#A8E6CF" : "#FF6B35", fontWeight: "bold" }}>
                    {Number(s.delta) > 0 ? "▲" : "▼"} {Math.abs(s.delta)} {s.unit} vs last
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ key: "weight", label: "Weight" }, { key: "rhr", label: "Heart Rate" }].map(t => (
          <button key={t.key} onClick={() => setMetric(t.key)} style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, background: metric === t.key ? member.color : "rgba(255,255,255,0.07)", color: metric === t.key ? "#000" : "#f0ece4", fontWeight: metric === t.key ? "bold" : "normal" }}>{t.label}</button>
        ))}
      </div>

      {data.length > 1 && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <svg viewBox="0 0 300 120" style={{ width: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id={`mg${member.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={member.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={member.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[20, 55, 90].map(y => <line key={y} x1="10" y1={y} x2="290" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
            <polygon points={`${cd[0].x},110 ${pts(metric === "weight" ? "wY" : "rY")} ${cd[cd.length-1].x},110`} fill={`url(#mg${member.id})`} />
            <polyline points={pts(metric === "weight" ? "wY" : "rY")} fill="none" stroke={member.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {cd.map((d, i) => {
              const y = metric === "weight" ? d.wY : d.rY;
              const val = metric === "weight" ? d.weight : d.rhr;
              return (
                <g key={i}>
                  <circle cx={d.x} cy={y} r="4" fill={member.color} />
                  <circle cx={d.x} cy={y} r="7" fill={member.color} opacity="0.18" />
                  <text x={d.x} y={y - 10} textAnchor="middle" fill="#f0ece4" fontSize="9" fontWeight="bold">{val}</text>
                  <text x={d.x} y={115} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">{d.date.split(" ")[1]}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>History</div>
      {[...data].reverse().map((entry, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${member.color}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, fontWeight: "bold" }}>{entry.date}</div>
            <div style={{ display: "flex", gap: 14 }}>
              <span style={{ fontSize: 13 }}>⚖️ {entry.weight} lbs</span>
              <span style={{ fontSize: 13 }}>❤️ {entry.rhr} bpm</span>
            </div>
          </div>
          {entry.notes && <div style={{ fontSize: 12, opacity: 0.55, marginTop: 6, fontStyle: "italic" }}>"{entry.notes}"</div>}
        </div>
      ))}
    </div>
  );
}

// ─── JOURNAL ─────────────────────────────────────────────────────────────────

function JournalTab({ member }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(JOURNAL_PROMPTS[0]);
  const [form, setForm] = useState({ run: "", mood: "😄", rating: 7, entry: "" });
  const entries = JOURNAL_SEED[member.id] || [];
  const moods = ["😩","😕","🙂","😄","💪","🔥"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Run Journal</div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{member.name}'s Reflections</div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: member.color, border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Write</button>
      </div>

      {showAdd && (
        <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${member.color}44`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>📝 New Entry</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>TODAY'S PROMPT</div>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4 }}>
              {JOURNAL_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => setSelectedPrompt(p)} style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, background: selectedPrompt === p ? member.color : "rgba(255,255,255,0.07)", color: selectedPrompt === p ? "#000" : "#f0ece4" }}>P{i+1}</button>
              ))}
            </div>
            <div style={{ background: `${member.color}12`, border: `1px solid ${member.color}28`, borderRadius: 10, padding: 10, marginTop: 8, fontSize: 13, fontStyle: "italic", color: member.color }}>"{selectedPrompt}"</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>RUN</div>
            <input value={form.run} onChange={e => setForm({ ...form, run: e.target.value })} placeholder="Easy 4mi" style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 6 }}>MOOD</div>
            <div style={{ display: "flex", gap: 8 }}>
              {moods.map(m => (
                <button key={m} onClick={() => setForm({ ...form, mood: m })} style={{ fontSize: 22, background: form.mood === m ? `${member.color}28` : "rgba(255,255,255,0.06)", border: `2px solid ${form.mood === m ? member.color : "transparent"}`, borderRadius: 10, padding: "4px 7px", cursor: "pointer" }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.55, marginBottom: 5 }}><span>EFFORT RATING</span><span style={{ color: member.color, fontWeight: "bold" }}>{form.rating}/10</span></div>
            <input type="range" min="1" max="10" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} style={{ width: "100%", accentColor: member.color }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>REFLECTION</div>
            <textarea value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} placeholder="Write freely — this is just for you..." rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, resize: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => setShowAdd(false)} style={{ flex: 2, background: member.color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save Entry ✓</button>
          </div>
        </div>
      )}

      {entries.length === 0
        ? <div style={{ textAlign: "center", padding: 40, opacity: 0.45, border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 16 }}><div style={{ fontSize: 30, marginBottom: 10 }}>📖</div><div>No entries yet. After your next run, write about how it went!</div></div>
        : entries.map((e, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${member.color}18`, borderLeft: `3px solid ${member.color}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: member.color, letterSpacing: 1 }}>{e.date} — {e.run}</div>
                <div style={{ fontStyle: "italic", fontSize: 11, opacity: 0.45, marginTop: 3 }}>"{e.prompt}"</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 22 }}>{e.mood}</div>
                <div style={{ background: `${member.color}18`, color: member.color, borderRadius: 8, padding: "3px 8px", fontSize: 12, fontWeight: "bold" }}>{e.rating}/10</div>
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.85 }}>{e.entry}</div>
          </div>
        ))
      }
    </div>
  );
}

// ─── RECOVERY ─────────────────────────────────────────────────────────────────

function RecoveryTab({ member }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ sleep: 7, soreness: 3, energy: 7, notes: "" });
  const entries = RECOVERY_SEED[member.id] || [];
  const latest  = entries[0];
  const preview = getReadiness(form.sleep, form.soreness, form.energy);
  const recoveryTips = {
    "Go Hard":  ["✅ You're primed — stick to your planned workout", "💧 Hydrate well pre-run for max performance", "🏃 Good day to attempt a PR or tough workout"],
    "Moderate": ["🎯 Moderate effort — don't push to your limit", "🧘 Add 10 min dynamic stretching pre-run", "💤 Prioritize 8+ hours sleep tonight"],
    "Easy Day": ["🚶 Keep it easy — a short walk or light jog is ideal", "🧊 Consider ice/foam roll on sore spots", "🥗 Focus on anti-inflammatory foods today"],
    "Rest":     ["🛌 True rest day — your body is asking for it", "🧴 Gentle stretching or yoga only", "🥛 Protein + sleep = your best recovery tools"],
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Recovery</div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{member.name}'s Readiness</div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: member.color, border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Check In</button>
      </div>

      {latest && !showAdd && (
        <div style={{ background: `${readinessColor[latest.readiness]}12`, border: `1px solid ${readinessColor[latest.readiness]}35`, borderRadius: 20, padding: 20, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, opacity: 0.55, textTransform: "uppercase", marginBottom: 8 }}>Today's Readiness Score</div>
          <div style={{ fontSize: 28, fontWeight: "bold", color: readinessColor[latest.readiness], marginBottom: 4 }}>{readinessIcon[latest.readiness]} {latest.readiness}</div>
          <div style={{ fontSize: 12, opacity: 0.55 }}>Based on check-in from {latest.date}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14, fontSize: 13 }}>
            <span>😴 {latest.sleep}h sleep</span>
            <span>💢 {latest.soreness}/10 sore</span>
            <span>⚡ {latest.energy}/10 energy</span>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${member.color}44`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>🛌 Morning Check-In</div>
          {[
            { label: "Sleep (hours)",       key: "sleep",    min: 1, max: 12, color: "#7EC8E3", emoji: "😴", suffix: "h" },
            { label: "Muscle Soreness",     key: "soreness", min: 0, max: 10, color: "#FF6B35", emoji: "💢", suffix: "/10", note: "0=none, 10=very sore" },
            { label: "Energy Level",        key: "energy",   min: 0, max: 10, color: "#FFE66D", emoji: "⚡", suffix: "/10" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>{f.emoji} {f.label} {f.note && <span style={{ opacity: 0.45, fontSize: 10 }}>— {f.note}</span>}</span>
                <span style={{ color: f.color, fontWeight: "bold" }}>{form[f.key]}{f.suffix}</span>
              </div>
              <input type="range" min={f.min} max={f.max} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: Number(e.target.value) })} style={{ width: "100%", accentColor: f.color }} />
            </div>
          ))}
          <div style={{ background: `${readinessColor[preview]}12`, border: `1px solid ${readinessColor[preview]}35`, borderRadius: 12, padding: 12, marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, opacity: 0.55, marginBottom: 4 }}>YOUR READINESS</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: readinessColor[preview] }}>{readinessIcon[preview]} {preview}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>NOTES (optional)</div>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any aches, or how you feel..." style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => setShowAdd(false)} style={{ flex: 2, background: member.color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save ✓</button>
          </div>
        </div>
      )}

      {latest && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 15, marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.55, textTransform: "uppercase", marginBottom: 12 }}>Recovery Recommendations</div>
          {(recoveryTips[latest.readiness] || []).map((tip, i) => (
            <div key={i} style={{ fontSize: 13, padding: "7px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none", lineHeight: 1.5 }}>{tip}</div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>History</div>
      {entries.map((e, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${readinessColor[e.readiness]}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: "bold" }}>{e.date}</div>
            <div style={{ fontSize: 11, padding: "3px 9px", borderRadius: 8, fontWeight: "bold", background: `${readinessColor[e.readiness]}18`, color: readinessColor[e.readiness] }}>{e.readiness}</div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 7, fontSize: 12, opacity: 0.65 }}>
            <span>😴 {e.sleep}h</span><span>💢 {e.soreness}/10</span><span>⚡ {e.energy}/10</span>
          </div>
          {e.notes && <div style={{ fontSize: 12, opacity: 0.5, marginTop: 5, fontStyle: "italic" }}>"{e.notes}"</div>}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function FamilyTrainingApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMember, setSelectedMember] = useState(FAMILY_MEMBERS[0]);
  const [showLogRun, setShowLogRun] = useState(false);
  const [expandedNutrition, setExpandedNutrition] = useState(null);
  const [newRun, setNewRun] = useState({ type: "Easy Run", miles: "", time: "", notes: "" });
  const [pushSettings, setPushSettings] = useState([true, true, false, false]);

  const memberRuns = RUNS.filter(r => r.memberId === selectedMember.id);
  const totalFamilyMiles = RUNS.reduce((s, r) => s + r.miles, 0);

  const tabs = [
    { id: "dashboard", label: "Home",      emoji: "🏠" },
    { id: "calendar",  label: "Training",  emoji: "📅" },
    { id: "recovery",  label: "Recovery",  emoji: "🛌" },
    { id: "metrics",   label: "Metrics",   emoji: "📈" },
    { id: "journal",   label: "Journal",   emoji: "📖" },
    { id: "nutrition", label: "Nutrition", emoji: "🥗" },
    { id: "plans",     label: "Plans",     emoji: "📋" },
    { id: "compete",   label: "Compete",   emoji: "🏆" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "linear-gradient(160deg,#080c14 0%,#111827 50%,#0c0a18 100%)", minHeight: "100vh", color: "#f0ece4", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse at 15% 15%,rgba(255,107,53,0.07) 0%,transparent 55%),radial-gradient(ellipse at 85% 80%,rgba(78,205,196,0.05) 0%,transparent 55%)" }} />

      {/* Sticky header */}
      <div style={{ padding: "20px 18px 13px", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,12,20,0.85)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF6B35", textTransform: "uppercase", marginBottom: 3 }}>Family</div>
            <div style={{ fontSize: 24, fontWeight: "bold", letterSpacing: -0.5 }}>Run Together</div>
          </div>
          <div style={{ background: "rgba(255,107,53,0.11)", border: "1px solid rgba(255,107,53,0.22)", borderRadius: 12, padding: "7px 13px", fontSize: 12 }}>🏃 {totalFamilyMiles.toFixed(1)} mi</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 13, overflowX: "auto", paddingBottom: 2 }}>
          {FAMILY_MEMBERS.map(m => (
            <button key={m.id} onClick={() => setSelectedMember(m)} style={{ flexShrink: 0, background: selectedMember.id === m.id ? m.color : "rgba(255,255,255,0.06)", border: `2px solid ${selectedMember.id === m.id ? m.color : "transparent"}`, borderRadius: 14, padding: "7px 13px", cursor: "pointer", color: selectedMember.id === m.id ? "#000" : "#f0ece4", fontSize: 13, fontWeight: selectedMember.id === m.id ? "bold" : "normal", transition: "all 0.2s" }}>{m.avatar} {m.name}</button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 92, zIndex: 9, overflowX: "auto", background: "rgba(8,12,20,0.75)", backdropFilter: "blur(8px)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flexShrink: 0, minWidth: 68, padding: "9px 5px", border: "none", background: "transparent", cursor: "pointer", color: activeTab === tab.id ? "#FF6B35" : "rgba(240,236,228,0.42)", borderBottom: `2px solid ${activeTab === tab.id ? "#FF6B35" : "transparent"}`, fontSize: 10, letterSpacing: 0.2, transition: "all 0.2s" }}>
            <div style={{ fontSize: 16 }}>{tab.emoji}</div>
            <div style={{ marginTop: 2 }}>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 18px 70px", position: "relative", zIndex: 1 }}>

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div>
            <WeatherWidget />
            <div style={{ background: `linear-gradient(135deg,${selectedMember.color}1e,${selectedMember.color}08)`, border: `1px solid ${selectedMember.color}30`, borderRadius: 20, padding: 18, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 34 }}>{selectedMember.avatar}</div>
                  <div style={{ fontSize: 22, fontWeight: "bold", marginTop: 6 }}>{selectedMember.name}</div>
                  <div style={{ fontSize: 13, color: selectedMember.color, marginTop: 2 }}>🎯 {selectedMember.goal}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ background: `${selectedMember.color}25`, borderRadius: 12, padding: "5px 11px", marginBottom: 7, fontSize: 13 }}>🔥 {selectedMember.streak} day streak</div>
                  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "5px 11px", fontSize: 13 }}>📍 {selectedMember.weeklyMiles} mi / wk</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5, opacity: 0.55 }}>
                  <span>Weekly progress</span><span>{Math.round((selectedMember.weeklyMiles / 20) * 100)}%</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, height: 7 }}>
                  <div style={{ width: `${Math.min((selectedMember.weeklyMiles / 20) * 100, 100)}%`, background: selectedMember.color, borderRadius: 8, height: "100%", transition: "width 0.6s" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[
                { label: "Runs this month", value: memberRuns.length, emoji: "📊" },
                { label: "Total miles", value: memberRuns.reduce((s, r) => s + r.miles, 0).toFixed(1), emoji: "🗺️" },
                { label: "Avg pace (min/mi)", value: "9:36", emoji: "⏱️" },
                { label: "Best streak", value: `${selectedMember.streak}d`, emoji: "🔥" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 13 }}>
                  <div style={{ fontSize: 20 }}>{s.emoji}</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", marginTop: 5 }}>{s.value}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 15, marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>This Week's Leaderboard</div>
              {[...FAMILY_MEMBERS].sort((a, b) => b.weeklyMiles - a.weeklyMiles).map((m, i) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ width: 22, fontSize: 14, textAlign: "center" }}>{["🥇","🥈","🥉",""][i]}</div>
                  <div style={{ fontSize: 18 }}>{m.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: "bold" }}>{m.name}</div>
                    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 4, marginTop: 4 }}>
                      <div style={{ width: `${(m.weeklyMiles / 20) * 100}%`, background: m.color, borderRadius: 4, height: "100%" }} />
                    </div>
                  </div>
                  <div style={{ color: m.color, fontWeight: "bold", fontSize: 14 }}>{m.weeklyMiles} mi</div>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg,rgba(78,205,196,0.12),rgba(78,205,196,0.04))", border: "1px solid rgba(78,205,196,0.22)", borderRadius: 16, padding: 15 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#4ECDC4", textTransform: "uppercase", marginBottom: 8 }}>Coach's Tip Today</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.88 }}>"Consistency beats intensity every time. A 30-minute easy run today is worth more than skipping because you can't do a hard workout. Just get out there!"</div>
            </div>
          </div>
        )}

        {/* ── TRAINING ── */}
        {activeTab === "calendar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Training Log</div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>{selectedMember.name}'s Runs</div>
              </div>
              <button onClick={() => setShowLogRun(true)} style={{ background: "#FF6B35", border: "none", borderRadius: 12, padding: "9px 15px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>+ Log Run</button>
            </div>
            {showLogRun && (
              <div style={{ background: "rgba(26,26,46,0.97)", border: "1px solid rgba(255,107,53,0.28)", borderRadius: 20, padding: 18, marginBottom: 18 }}>
                <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>Log a Run 🏃</div>
                {[
                  { label: "Run Type", key: "type", type: "select", options: ["Easy Run","Tempo","Long Run","Intervals","Walk/Run","Race"] },
                  { label: "Distance (miles)", key: "miles", type: "number", placeholder: "e.g. 3.1" },
                  { label: "Time",             key: "time",  type: "text",   placeholder: "e.g. 28:45" },
                  { label: "Notes",            key: "notes", type: "text",   placeholder: "How did it feel?" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>{f.label}</div>
                    {f.type === "select"
                      ? <select value={newRun[f.key]} onChange={e => setNewRun({ ...newRun, [f.key]: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14 }}>{f.options.map(o => <option key={o}>{o}</option>)}</select>
                      : <input type={f.type} placeholder={f.placeholder} value={newRun[f.key]} onChange={e => setNewRun({ ...newRun, [f.key]: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box" }} />
                    }
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 13 }}>
                  <button onClick={() => setShowLogRun(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 11, color: "#f0ece4", cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => setShowLogRun(false)} style={{ flex: 2, background: "#FF6B35", border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Save Run ✓</button>
                </div>
              </div>
            )}
            {memberRuns.length === 0
              ? <div style={{ textAlign: "center", padding: 40, opacity: 0.45 }}>No runs logged yet. Get out there! 👟</div>
              : memberRuns.map(run => (
                <div key={run.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${selectedMember.color}`, borderRadius: 16, padding: 15, marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 15 }}>{run.type}</div>
                      <div style={{ fontSize: 11, opacity: 0.42, marginTop: 2 }}>{run.date}</div>
                      {run.notes && <div style={{ fontSize: 12, opacity: 0.62, marginTop: 5, fontStyle: "italic" }}>"{run.notes}"</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: selectedMember.color, fontWeight: "bold", fontSize: 18 }}>{run.miles} mi</div>
                      <div style={{ fontSize: 12, opacity: 0.5 }}>⏱ {run.time}</div>
                    </div>
                  </div>
                </div>
              ))
            }
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>This Week's Schedule</div>
              {["Mon — Rest Day","Tue — Easy 4 miles","Wed — Strength + Core","Thu — Tempo 3 miles","Fri — Rest","Sat — Long Run 8 miles","Sun — Recovery Walk"].map((day, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: i < 2 ? 0.4 : 1 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: i < 2 ? "#4ECDC4" : i === 2 ? "#FF6B35" : "rgba(255,255,255,0.18)" }} />
                  <div style={{ fontSize: 14, flex: 1 }}>{day}</div>
                  {i < 2 && <div style={{ fontSize: 11, color: "#4ECDC4" }}>✓ Done</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECOVERY ── */}
        {activeTab === "recovery" && <RecoveryTab member={selectedMember} />}

        {/* ── METRICS ── */}
        {activeTab === "metrics" && <BodyMetricsTab member={selectedMember} />}

        {/* ── JOURNAL ── */}
        {activeTab === "journal" && <JournalTab member={selectedMember} />}

        {/* ── NUTRITION ── */}
        {activeTab === "nutrition" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Runner's Kitchen</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>Fuel Your Training</div>
            </div>
            <div style={{ background: "linear-gradient(135deg,rgba(78,205,196,0.12),rgba(78,205,196,0.04))", border: "1px solid rgba(78,205,196,0.22)", borderRadius: 16, padding: 15, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#4ECDC4", marginBottom: 3 }}>💧 Hydration Today</div>
                  <div style={{ fontSize: 26, fontWeight: "bold" }}>48 oz</div>
                  <div style={{ fontSize: 11, opacity: 0.5 }}>Goal: 80 oz</div>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 108, justifyContent: "flex-end" }}>
                  {[...Array(10)].map((_,i) => <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: i < 6 ? "#4ECDC4" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>💧</div>)}
                </div>
              </div>
            </div>
            {NUTRITION.map((n, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${n.color}25`, borderRadius: 16, marginBottom: 11, overflow: "hidden" }}>
                <div onClick={() => setExpandedNutrition(expandedNutrition === i ? null : i)} style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, cursor: "pointer" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", background: `${n.color}16` }}>{n.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold", fontSize: 14 }}>{n.category}</div>
                    <div style={{ fontSize: 11, color: n.color, marginTop: 2 }}>⏰ {n.timing}</div>
                  </div>
                  <div style={{ opacity: 0.32, fontSize: 15 }}>{expandedNutrition === i ? "▲" : "▼"}</div>
                </div>
                {expandedNutrition === i && (
                  <div style={{ padding: "0 15px 15px", borderTop: `1px solid ${n.color}15` }}>
                    <div style={{ paddingTop: 12 }}>
                      <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Best Foods</div>
                      {n.foods.map((f, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: j < n.foods.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: n.color, flexShrink: 0 }} />
                          <div style={{ fontSize: 13 }}>{f}</div>
                        </div>
                      ))}
                      <div style={{ marginTop: 12, background: `${n.color}10`, borderRadius: 10, padding: 11, fontSize: 12, lineHeight: 1.6, borderLeft: `3px solid ${n.color}` }}>💡 {n.tip}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 15 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Runner's Macro Split</div>
              {[
                { label: "Carbohydrates", pct: 55, color: "#FFE66D", note: "Primary fuel" },
                { label: "Protein",       pct: 25, color: "#FF6B35", note: "Muscle repair" },
                { label: "Fats",          pct: 20, color: "#4ECDC4", note: "Sustained energy" },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span>{m.label} <span style={{ opacity: 0.42, fontSize: 10 }}>— {m.note}</span></span>
                    <span style={{ color: m.color, fontWeight: "bold" }}>{m.pct}%</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 5, height: 6 }}>
                    <div style={{ width: `${m.pct}%`, background: m.color, borderRadius: 5, height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLANS ── */}
        {activeTab === "plans" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Training Plans</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>Find Your Program</div>
            </div>
            {WORKOUT_PLANS.map((plan, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 17, marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                  <div style={{ fontSize: 28 }}>{plan.emoji}</div>
                  <div style={{ background: plan.level === "Beginner" ? "rgba(168,230,207,0.16)" : plan.level === "Intermediate" ? "rgba(255,230,109,0.16)" : "rgba(255,107,53,0.16)", color: plan.level === "Beginner" ? "#A8E6CF" : plan.level === "Intermediate" ? "#FFE66D" : "#FF6B35", borderRadius: 8, padding: "3px 9px", fontSize: 10, fontWeight: "bold" }}>{plan.level}</div>
                </div>
                <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 13, opacity: 0.62, marginBottom: 11 }}>{plan.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, opacity: 0.42 }}>📅 {plan.weeks} weeks</div>
                  <button style={{ background: "#FF6B35", border: "none", borderRadius: 10, padding: "7px 14px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 12 }}>Start Plan →</button>
                </div>
              </div>
            ))}
            <div style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.16)", borderRadius: 16, padding: 15, marginTop: 6 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: "#FF6B35", textTransform: "uppercase", marginBottom: 13 }}>⚙️ Push Mode Settings</div>
              {[
                { label: "Rest Day Reminders",  sublabel: "Prompt to walk on off days" },
                { label: "Pace Challenges",     sublabel: "Weekly faster-pace micro goals" },
                { label: "Extra Mile Mode",     sublabel: "Suggest adding 0.5mi to runs" },
                { label: "Early Morning Nudge", sublabel: "6am motivation notification" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13 }}>{s.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.42, marginTop: 2 }}>{s.sublabel}</div>
                  </div>
                  <div onClick={() => setPushSettings(ps => ps.map((v, idx) => idx === i ? !v : v))} style={{ width: 42, height: 22, borderRadius: 11, background: pushSettings[i] ? "#FF6B35" : "rgba(255,255,255,0.12)", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: 2, left: pushSettings[i] ? 21 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPETE ── */}
        {activeTab === "compete" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Family Competition</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>Compete Together</div>
            </div>
            {CHALLENGES.map(c => (
              <div key={c.id} style={{ background: c.active ? "rgba(255,107,53,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${c.active ? "rgba(255,107,53,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 15, marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: c.active ? 12 : 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: 26 }}>{c.emoji}</div>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 14 }}>{c.title}</div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{c.desc}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 8, fontWeight: "bold", background: c.active ? "rgba(168,230,207,0.16)" : "rgba(255,255,255,0.07)", color: c.active ? "#A8E6CF" : "rgba(255,255,255,0.32)" }}>{c.active ? "LIVE" : "UPCOMING"}</div>
                </div>
                {c.active && [...FAMILY_MEMBERS].sort((a, b) => b.weeklyMiles - a.weeklyMiles).map((m, j) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                    <div style={{ width: 18, fontSize: 13, textAlign: "center" }}>{["🥇","🥈","🥉",""][j]}</div>
                    <div style={{ fontSize: 14 }}>{m.avatar}</div>
                    <div style={{ fontSize: 12, flex: 1 }}>{m.name}</div>
                    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 5, height: 5, width: 70 }}>
                      <div style={{ width: `${(m.weeklyMiles / 20) * 100}%`, background: m.color, borderRadius: 5, height: "100%" }} />
                    </div>
                    <div style={{ color: m.color, fontWeight: "bold", fontSize: 12, width: 34, textAlign: "right" }}>{m.weeklyMiles}mi</div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase", marginBottom: 13 }}>Badges Earned</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 9 }}>
                {[
                  { emoji: "🏅", label: "First 5K" },{ emoji: "🔥", label: "7-Day Streak" },
                  { emoji: "⚡", label: "PR Setter" },{ emoji: "🌅", label: "Early Bird" },
                  { emoji: "🗺️", label: "50 Miles" },{ emoji: "👨‍👩‍👧‍👦", label: "Family Run" },
                  { emoji: "❄️", label: "Winter Run" },{ emoji: "🌧️", label: "Rain Runner" },
                ].map((b, i) => (
                  <div key={i} style={{ background: i < 4 ? "rgba(255,230,109,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${i < 4 ? "rgba(255,230,109,0.22)" : "rgba(255,255,255,0.05)"}`, borderRadius: 12, padding: 9, textAlign: "center", opacity: i < 4 ? 1 : 0.25 }}>
                    <div style={{ fontSize: 22 }}>{b.emoji}</div>
                    <div style={{ fontSize: 9, marginTop: 4, opacity: 0.72 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}