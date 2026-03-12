import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ─── PACE HELPERS ─────────────────────────────────────────────────────────────
function parsePace(p) {
  const [m, s] = (p || "9:00").split(":").map(Number);
  return m * 60 + (s || 0);
}
function secsToPace(s) {
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── PLAN GENERATORS ─────────────────────────────────────────────────────────
function generatePreset(name, numWeeks) {
  const templates = {
    "Couch to 5K": (w, total) => [
      { day: "Mon", type: w < Math.floor(total/3) ? "Walk/Run" : "Easy Run", miles: +(1 + w * (1.5/total)).toFixed(1), pace: "conversational", notes: w < Math.floor(total/3) ? `Run ${w+1} min, walk 2 min × 5` : "Run 20–30 min easy" },
      { day: "Tue", type: "Rest", miles: 0, pace: "—", notes: "Rest or light stretching" },
      { day: "Wed", type: w < Math.floor(total/3) ? "Walk/Run" : "Easy Run", miles: +(1 + w * (1.5/total)).toFixed(1), pace: "conversational", notes: "Repeat Monday's workout" },
      { day: "Thu", type: "Rest", miles: 0, pace: "—", notes: "Rest day" },
      { day: "Fri", type: w < Math.floor(total/3) ? "Walk/Run" : "Easy Run", miles: +(1.2 + w * (1.5/total)).toFixed(1), pace: "conversational", notes: "Slightly longer effort" },
      { day: "Sat", type: "Rest", miles: 0, pace: "—", notes: "Rest or walk" },
      { day: "Sun", type: "Rest", miles: 0, pace: "—", notes: "Rest day" },
    ],
    "5K Speed Builder": (w, total) => [
      { day: "Mon", type: "Easy Run",  miles: +(3 + w * (1/total)).toFixed(1),   pace: "easy",  notes: "Warm up, easy effort" },
      { day: "Tue", type: "Intervals", miles: +(2 + w * (1/total)).toFixed(1),   pace: "fast",  notes: `${4 + Math.floor(w/2)} × 400m at 5K pace, 90s rest` },
      { day: "Wed", type: "Rest",      miles: 0,                                 pace: "—",     notes: "Rest or cross-train" },
      { day: "Thu", type: "Tempo",     miles: +(2.5 + w * (1.5/total)).toFixed(1), pace: "tempo", notes: "20–30 min comfortably hard" },
      { day: "Fri", type: "Rest",      miles: 0,                                 pace: "—",     notes: "Rest day" },
      { day: "Sat", type: "Long Run",  miles: +(4 + w * (2/total)).toFixed(1),   pace: "easy",  notes: "Long slow distance" },
      { day: "Sun", type: "Rest",      miles: 0,                                 pace: "—",     notes: "Recovery day" },
    ],
    "10K Foundation": (w, total) => [
      { day: "Mon", type: "Easy Run",  miles: +(3 + w * (2/total)).toFixed(1),   pace: "easy",  notes: "Easy conversational pace" },
      { day: "Tue", type: "Tempo",     miles: +(2 + w * (1.5/total)).toFixed(1), pace: "tempo", notes: "Comfortably hard, 20–30 min" },
      { day: "Wed", type: "Rest",      miles: 0,                                 pace: "—",     notes: "Rest or yoga" },
      { day: "Thu", type: "Intervals", miles: +(2.5 + w * (1/total)).toFixed(1), pace: "fast",  notes: `${3 + Math.floor(w/2)} × 800m at 10K pace` },
      { day: "Fri", type: "Rest",      miles: 0,                                 pace: "—",     notes: "Rest day" },
      { day: "Sat", type: "Long Run",  miles: +(5 + w * (3/total)).toFixed(1),   pace: "easy",  notes: "Weekly long run, keep it easy" },
      { day: "Sun", type: "Easy Run",  miles: +(2 + w * (0.5/total)).toFixed(1), pace: "easy",  notes: "Short recovery run" },
    ],
    "Half Marathon Prep": (w, total) => [
      { day: "Mon", type: "Rest",      miles: 0,                                 pace: "—",     notes: "Rest day" },
      { day: "Tue", type: "Easy Run",  miles: +(4 + w * (2/total)).toFixed(1),   pace: "easy",  notes: "Easy recovery run" },
      { day: "Wed", type: "Tempo",     miles: +(3 + w * (2/total)).toFixed(1),   pace: "tempo", notes: "Tempo intervals or steady tempo" },
      { day: "Thu", type: "Easy Run",  miles: +(3 + w * (1.5/total)).toFixed(1), pace: "easy",  notes: "Easy effort, keep HR low" },
      { day: "Fri", type: "Rest",      miles: 0,                                 pace: "—",     notes: "Rest or light cross-train" },
      { day: "Sat", type: "Long Run",  miles: +(6 + w * (5/total)).toFixed(1),   pace: "easy",  notes: "Most important run of the week" },
      { day: "Sun", type: "Easy Run",  miles: +(3 + w * (0.5/total)).toFixed(1), pace: "easy",  notes: "Short shakeout run" },
    ],
  };

  const gen = templates[name];
  if (!gen) return [];
  return Array.from({ length: numWeeks }, (_, w) => {
    const isTaper = w >= numWeeks - 2;
    const days = gen(w, numWeeks).map(d => isTaper ? { ...d, miles: +(d.miles * (w === numWeeks - 1 ? 0.4 : 0.6)).toFixed(1) } : d);
    return { week: w + 1, label: isTaper ? (w === numWeeks - 1 ? "🎯 Race Week" : "🏁 Taper") : `Week ${w + 1}`, days };
  });
}

function generateCustomPlan(distanceMiles, goalPaceStr, numWeeks) {
  const gps = parsePace(goalPaceStr);
  const easy = gps * 1.3, tempo = gps * 1.08, interval = gps * 0.95, longPace = gps * 1.35;
  const peakLong = distanceMiles * 1.1;
  return Array.from({ length: numWeeks }, (_, w) => {
    const prog = w / Math.max(numWeeks - 1, 1);
    const isTaper = w >= numWeeks - 2;
    const longMiles = +(distanceMiles * 0.5 + peakLong * 0.5 * prog).toFixed(1);
    const easyMiles = +(distanceMiles * 0.3 + 2 * prog).toFixed(1);
    const tempoMiles = +(2 + distanceMiles * 0.15 * prog).toFixed(1);
    return {
      week: w + 1,
      label: isTaper ? (w === numWeeks - 1 ? "🎯 Race Week" : "🏁 Taper") : `Week ${w + 1}`,
      days: [
        { day: "Mon", type: "Rest",      miles: 0, pace: "—", notes: "Rest day" },
        { day: "Tue", type: "Easy Run",  miles: isTaper ? +(easyMiles*0.6).toFixed(1) : easyMiles, pace: secsToPace(easy)+"/mi", notes: "Conversational pace" },
        { day: "Wed", type: "Tempo",     miles: isTaper ? +(tempoMiles*0.5).toFixed(1) : tempoMiles, pace: secsToPace(tempo)+"/mi", notes: "Comfortably hard effort" },
        { day: "Thu", type: "Intervals", miles: +(easyMiles*0.8).toFixed(1), pace: secsToPace(interval)+"/mi", notes: `${3+w} × 400m at goal pace` },
        { day: "Fri", type: "Rest",      miles: 0, pace: "—", notes: "Rest or stretch" },
        { day: "Sat", type: isTaper ? "Easy Run" : "Long Run", miles: isTaper ? +(longMiles*0.5).toFixed(1) : longMiles, pace: secsToPace(longPace)+"/mi", notes: isTaper ? "Short shakeout" : "Slow and steady!" },
        { day: "Sun", type: "Rest",      miles: 0, pace: "—", notes: "Recovery day" },
      ]
    };
  });
}

const PRESET_PLANS = [
  { name: "Couch to 5K",        defaultWeeks: 9,  minWeeks: 6,  maxWeeks: 16, level: "Beginner",     emoji: "🌱", desc: "Run your first 5K with walk/run intervals" },
  { name: "5K Speed Builder",   defaultWeeks: 6,  minWeeks: 4,  maxWeeks: 12, level: "Intermediate", emoji: "⚡", desc: "Break your PR with tempo runs & intervals" },
  { name: "10K Foundation",     defaultWeeks: 10, minWeeks: 6,  maxWeeks: 16, level: "Intermediate", emoji: "🔥", desc: "Build endurance to comfortably race 10K" },
  { name: "Half Marathon Prep", defaultWeeks: 14, minWeeks: 10, maxWeeks: 20, level: "Advanced",     emoji: "🏅", desc: "Full structured half marathon training" },
];

const levelColor = { Beginner: "#A8E6CF", Intermediate: "#FFE66D", Advanced: "#FF6B35" };
const levelBg    = { Beginner: "rgba(168,230,207,0.16)", Intermediate: "rgba(255,230,109,0.16)", Advanced: "rgba(255,107,53,0.16)" };
const typeColor  = { "Easy Run": "#4ECDC4", Tempo: "#FFE66D", Intervals: "#FF6B35", "Long Run": "#C9A4F0", "Walk/Run": "#A8E6CF", Rest: "rgba(255,255,255,0.18)" };

export default function PlansTab({ color, userId, onPlanActivated, hasActivePlan }) {
  const [configuring, setConfiguring]   = useState(null); // plan name being configured
  const [weekSlider, setWeekSlider]     = useState(9);
  const [raceDate, setRaceDate]         = useState("");
  const [preview, setPreview]           = useState(null); // { name, weeks, schedule }
  const [activating, setActivating]     = useState(false);
  const [warnActive, setWarnActive]     = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showCustom, setShowCustom]     = useState(false);
  const [customDist, setCustomDist]     = useState("");
  const [customPace, setCustomPace]     = useState("");
  const [customWeeks, setCustomWeeks]   = useState(12);
  const [customRaceDate, setCustomRaceDate] = useState("");
  const [customPreview, setCustomPreview]   = useState(null);
  const [successMsg, setSuccessMsg]     = useState("");

  const inp = { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box", fontFamily: "Georgia, serif" };

  function openConfig(plan) {
    setConfiguring(plan.name);
    setWeekSlider(plan.defaultWeeks);
    setRaceDate("");
    setPreview(null);
    setExpandedWeek(null);
  }

  function handleRaceDateChange(dateStr, planMeta) {
    setRaceDate(dateStr);
    if (dateStr) {
      const weeks = Math.max(planMeta.minWeeks, Math.min(planMeta.maxWeeks, Math.floor((new Date(dateStr) - new Date()) / (7 * 86400000))));
      setWeekSlider(weeks);
    }
  }

  function buildPreview(plan) {
    const schedule = generatePreset(plan.name, weekSlider);
    setPreview({ name: plan.name, weeks: weekSlider, schedule });
    setExpandedWeek(null);
  }

  async function confirmActivate() {
    if (!preview) return;
    if (hasActivePlan && !warnActive) { setWarnActive(true); return; }
    setActivating(true);
    const today = new Date();
    const toInsert = [];
    preview.schedule.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        if (day.type === "Rest" || day.miles === 0) return;
        const d = new Date(today);
        d.setDate(today.getDate() + wi * 7 + di);
        toInsert.push({ user_id: userId, date: d.toISOString().split("T")[0], type: day.type, miles: day.miles, time: "", notes: `[${preview.name} — ${week.label}] ${day.notes}`, completed: false, plan_week: wi + 1 });
      });
    });
    if (toInsert.length) await supabase.from("runs").insert(toInsert);
    setActivating(false); setWarnActive(false);
    setSuccessMsg(`✅ ${preview.name} (${preview.weeks} weeks) added to your Training tab!`);
    setPreview(null); setConfiguring(null);
    setTimeout(() => setSuccessMsg(""), 4000);
    if (onPlanActivated) onPlanActivated();
  }

  function buildCustomPreview() {
    if (!customDist || !customPace || !customPace.includes(":")) return;
    const miles = parseFloat(customDist);
    if (isNaN(miles)) return;
    let weeks = customWeeks;
    if (customRaceDate) {
      weeks = Math.max(4, Math.min(24, Math.floor((new Date(customRaceDate) - new Date()) / (7 * 86400000))));
      setCustomWeeks(weeks);
    }
    setCustomPreview({ name: `${customDist} mi Goal Plan`, weeks, schedule: generateCustomPlan(miles, customPace, weeks) });
    setExpandedWeek(null);
  }

  async function confirmCustom() {
    if (!customPreview) return;
    if (hasActivePlan && !warnActive) { setWarnActive(true); return; }
    setActivating(true);
    const today = new Date();
    const toInsert = [];
    customPreview.schedule.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        if (day.type === "Rest" || day.miles === 0) return;
        const d = new Date(today);
        d.setDate(today.getDate() + wi * 7 + di);
        toInsert.push({ user_id: userId, date: d.toISOString().split("T")[0], type: day.type, miles: day.miles, time: "", notes: `[${customPreview.name} — ${week.label}] ${day.notes}`, completed: false, plan_week: wi + 1 });
      });
    });
    if (toInsert.length) await supabase.from("runs").insert(toInsert);
    setActivating(false); setWarnActive(false);
    setSuccessMsg(`✅ ${customPreview.name} added to your Training tab!`);
    setCustomPreview(null); setShowCustom(false);
    setTimeout(() => setSuccessMsg(""), 4000);
    if (onPlanActivated) onPlanActivated();
  }

  function WeekRows({ schedule, prefix }) {
    return schedule.map((week, wi) => {
      const key = `${prefix}-${wi}`;
      const isOpen = expandedWeek === key;
      const total = week.days.reduce((s, d) => s + d.miles, 0).toFixed(1);
      return (
        <div key={key} style={{ marginBottom: 7 }}>
          <div onClick={() => setExpandedWeek(isOpen ? null : key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: "bold" }}>{week.label}</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 12, opacity: 0.5 }}>{total} mi</div>
              <div style={{ opacity: 0.3 }}>{isOpen ? "▲" : "▼"}</div>
            </div>
          </div>
          {isOpen && (
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "0 0 10px 10px", padding: "6px 14px 10px" }}>
              {week.days.map((day, di) => (
                <div key={di} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: di < 6 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ width: 32, fontSize: 11, fontWeight: "bold", opacity: 0.4, paddingTop: 2, flexShrink: 0 }}>{day.day}</div>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor[day.type] || "#fff", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: day.type === "Rest" ? "normal" : "bold", opacity: day.type === "Rest" ? 0.38 : 1 }}>{day.type}</span>
                      {day.miles > 0 && <span style={{ fontSize: 12, color: typeColor[day.type] || color, fontWeight: "bold" }}>{day.miles} mi</span>}
                    </div>
                    {day.miles > 0 && <div style={{ fontSize: 11, opacity: 0.42, marginTop: 1 }}>⏱ {day.pace}</div>}
                    <div style={{ fontSize: 11, opacity: 0.48, marginTop: 2, lineHeight: 1.4 }}>{day.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Training Plans</div>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>Find Your Program</div>
      </div>

      {successMsg && (
        <div style={{ background: "rgba(168,230,207,0.15)", border: "1px solid rgba(168,230,207,0.4)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#A8E6CF" }}>{successMsg}</div>
      )}

      {hasActivePlan && (
        <div style={{ background: "rgba(255,230,109,0.1)", border: "1px solid rgba(255,230,109,0.3)", borderRadius: 12, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#FFE66D" }}>
          ⚠️ You have an active plan running. Starting a new one will add it on top of your existing schedule.
        </div>
      )}

      {/* Preset plans */}
      {PRESET_PLANS.map((plan, i) => {
        const isConfiguring = configuring === plan.name;
        return (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 13, overflow: "hidden" }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 26 }}>{plan.emoji}</div>
                <div style={{ background: levelBg[plan.level], color: levelColor[plan.level], borderRadius: 8, padding: "3px 9px", fontSize: 10, fontWeight: "bold" }}>{plan.level}</div>
              </div>
              <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 3 }}>{plan.name}</div>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>{plan.desc}</div>
              <button onClick={() => isConfiguring ? setConfiguring(null) : openConfig(plan)} style={{ width: "100%", background: isConfiguring ? "rgba(255,255,255,0.06)" : color, border: "none", borderRadius: 10, padding: "10px", color: isConfiguring ? "#f0ece4" : "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                {isConfiguring ? "Cancel ✕" : "Customize & Start →"}
              </button>
            </div>

            {/* Configuration panel */}
            {isConfiguring && !preview && (
              <div style={{ borderTop: `1px solid ${color}20`, padding: "16px 16px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 14, color }}>⚙️ Customize Your Plan</div>

                {/* Week slider */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ opacity: 0.6 }}>Number of weeks</span>
                    <span style={{ color, fontWeight: "bold" }}>{weekSlider} weeks</span>
                  </div>
                  <input type="range" min={plan.minWeeks} max={plan.maxWeeks} value={weekSlider} onChange={e => setWeekSlider(Number(e.target.value))} style={{ width: "100%", accentColor: color }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.38, marginTop: 3 }}>
                    <span>{plan.minWeeks} wks (min)</span><span>{plan.maxWeeks} wks (max)</span>
                  </div>
                </div>

                {/* Race date */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 5 }}>RACE DATE (optional — auto-sets weeks)</div>
                  <input type="date" value={raceDate} onChange={e => handleRaceDateChange(e.target.value, plan)} style={inp} />
                  {raceDate && <div style={{ fontSize: 11, color, marginTop: 5 }}>📅 {weekSlider} weeks until race day</div>}
                </div>

                <button onClick={() => buildPreview(plan)} style={{ width: "100%", background: color, border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                  Preview {weekSlider}-Week Schedule →
                </button>
              </div>
            )}

            {/* Preview */}
            {isConfiguring && preview && preview.name === plan.name && (
              <div style={{ borderTop: `1px solid ${color}20`, padding: "14px 16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: "bold" }}>{preview.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{preview.weeks} weeks · {preview.schedule.reduce((s, w) => s + w.days.reduce((a, d) => a + d.miles, 0), 0).toFixed(0)} total miles</div>
                  </div>
                  <button onClick={() => setPreview(null)} style={{ fontSize: 11, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "5px 10px", color: "#f0ece4", cursor: "pointer" }}>← Back</button>
                </div>

                {/* Active plan warning */}
                {warnActive && (
                  <div style={{ background: "rgba(255,230,109,0.12)", border: "1px solid rgba(255,230,109,0.35)", borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 13 }}>
                    <div style={{ color: "#FFE66D", fontWeight: "bold", marginBottom: 5 }}>⚠️ You already have an active plan!</div>
                    <div style={{ opacity: 0.75 }}>This will add runs on top of your existing schedule. Are you sure?</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={() => setWarnActive(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: 9, color: "#f0ece4", cursor: "pointer", fontSize: 12 }}>Cancel</button>
                      <button onClick={confirmActivate} style={{ flex: 2, background: "#FFE66D", border: "none", borderRadius: 8, padding: 9, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 12 }}>Yes, Add Anyway</button>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.42, textTransform: "uppercase", marginBottom: 10 }}>Week-by-Week Preview</div>
                <WeekRows schedule={preview.schedule} prefix={`prev-${plan.name}`} />

                {!warnActive && (
                  <button onClick={confirmActivate} disabled={activating} style={{ width: "100%", background: color, border: "none", borderRadius: 10, padding: 13, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 14, marginTop: 14 }}>
                    {activating ? "Adding to calendar..." : `Start ${preview.weeks}-Week Plan →`}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Custom plan builder */}
      <div style={{ background: `${color}0a`, border: `1px solid ${color}25`, borderRadius: 16, overflow: "hidden", marginTop: 6 }}>
        <div onClick={() => { setShowCustom(!showCustom); setCustomPreview(null); setWarnActive(false); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: 24 }}>🛠️</div>
            <div style={{ fontWeight: "bold", fontSize: 15, marginTop: 7 }}>Build My Own Plan</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 3 }}>Enter distance, goal pace & timeline</div>
          </div>
          <div style={{ opacity: 0.3, fontSize: 18 }}>{showCustom ? "▲" : "▼"}</div>
        </div>

        {showCustom && !customPreview && (
          <div style={{ borderTop: `1px solid ${color}20`, padding: "14px 16px 18px" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>RACE DISTANCE (miles)</div>
              <input value={customDist} onChange={e => setCustomDist(e.target.value)} placeholder="3.1 = 5K · 6.2 = 10K · 13.1 = Half" style={inp} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>GOAL RACE PACE (per mile)</div>
              <input value={customPace} onChange={e => setCustomPace(e.target.value)} placeholder="e.g. 9:30" style={inp} />
              <div style={{ fontSize: 10, opacity: 0.38, marginTop: 3 }}>Format: MM:SS per mile</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ opacity: 0.6 }}>Number of weeks</span>
                <span style={{ color, fontWeight: "bold" }}>{customWeeks} weeks</span>
              </div>
              <input type="range" min={4} max={24} value={customWeeks} onChange={e => setCustomWeeks(Number(e.target.value))} style={{ width: "100%", accentColor: color }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>RACE DATE (optional)</div>
              <input type="date" value={customRaceDate} onChange={e => { setCustomRaceDate(e.target.value); if (e.target.value) setCustomWeeks(Math.max(4, Math.min(24, Math.floor((new Date(e.target.value) - new Date()) / (7 * 86400000))))); }} style={inp} />
            </div>
            <button onClick={buildCustomPreview} style={{ width: "100%", background: color, border: "none", borderRadius: 10, padding: 12, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>
              Generate My Plan ✨
            </button>
          </div>
        )}

        {showCustom && customPreview && (
          <div style={{ borderTop: `1px solid ${color}20`, padding: "14px 16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: "bold" }}>{customPreview.name}</div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{customPreview.weeks} weeks</div>
              </div>
              <button onClick={() => setCustomPreview(null)} style={{ fontSize: 11, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "5px 10px", color: "#f0ece4", cursor: "pointer" }}>← Back</button>
            </div>

            {/* Pace key */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 11, opacity: 0.42, letterSpacing: 1, marginBottom: 8 }}>YOUR PERSONALIZED PACES</div>
              {[
                { label: "Easy runs",      pace: secsToPace(parsePace(customPace) * 1.3),  c: "#4ECDC4" },
                { label: "Tempo runs",     pace: secsToPace(parsePace(customPace) * 1.08), c: "#FFE66D" },
                { label: "Intervals",      pace: secsToPace(parsePace(customPace) * 0.95), c: "#FF6B35" },
                { label: "Long runs",      pace: secsToPace(parsePace(customPace) * 1.35), c: "#C9A4F0" },
                { label: "Goal race pace", pace: customPace,                                c: color },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: p.c }} />{p.label}</div>
                  <div style={{ color: p.c, fontWeight: "bold" }}>{p.pace}/mi</div>
                </div>
              ))}
            </div>

            {warnActive && (
              <div style={{ background: "rgba(255,230,109,0.12)", border: "1px solid rgba(255,230,109,0.35)", borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 13 }}>
                <div style={{ color: "#FFE66D", fontWeight: "bold", marginBottom: 5 }}>⚠️ You already have an active plan!</div>
                <div style={{ opacity: 0.75 }}>This will add runs on top of your existing schedule.</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => setWarnActive(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: 9, color: "#f0ece4", cursor: "pointer", fontSize: 12 }}>Cancel</button>
                  <button onClick={confirmCustom} style={{ flex: 2, background: "#FFE66D", border: "none", borderRadius: 8, padding: 9, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 12 }}>Yes, Add Anyway</button>
                </div>
              </div>
            )}

            <WeekRows schedule={customPreview.schedule} prefix="custprev" />

            {!warnActive && (
              <button onClick={confirmCustom} disabled={activating} style={{ width: "100%", background: color, border: "none", borderRadius: 10, padding: 13, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 14, marginTop: 14 }}>
                {activating ? "Adding to calendar..." : `Start ${customPreview.weeks}-Week Plan →`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}