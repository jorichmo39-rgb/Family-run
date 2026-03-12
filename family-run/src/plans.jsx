import { useState } from "react";
import { supabase } from "./supabase";

// ─── PLAN DATA ────────────────────────────────────────────────────────────────
const PLAN_SCHEDULES = {
  "Couch to 5K": Array.from({ length: 9 }, (_, w) => ({
    week: w + 1,
    days: [
      { day: "Mon", type: w < 3 ? "Walk/Run" : "Easy Run", miles: +(1 + w * 0.3).toFixed(1), pace: "conversational", notes: w < 3 ? "Run 1 min, walk 2 min × 6" : "Run 20–30 min easy" },
      { day: "Tue", type: "Rest", miles: 0, pace: "—", notes: "Rest or light stretching" },
      { day: "Wed", type: w < 3 ? "Walk/Run" : "Easy Run", miles: +(1 + w * 0.3).toFixed(1), pace: "conversational", notes: w < 3 ? "Run 1.5 min, walk 2 min × 5" : "Repeat Monday" },
      { day: "Thu", type: "Rest", miles: 0, pace: "—", notes: "Rest day" },
      { day: "Fri", type: w < 3 ? "Walk/Run" : "Easy Run", miles: +(1.2 + w * 0.3).toFixed(1), pace: "conversational", notes: w < 3 ? "Run 2 min, walk 1.5 min × 5" : "Slightly longer easy run" },
      { day: "Sat", type: "Rest", miles: 0, pace: "—", notes: "Rest or walk" },
      { day: "Sun", type: "Rest", miles: 0, pace: "—", notes: "Rest day" },
    ]
  })),
  "5K Speed Builder": Array.from({ length: 6 }, (_, w) => ({
    week: w + 1,
    days: [
      { day: "Mon", type: "Easy Run",  miles: +(3 + w * 0.2).toFixed(1),   pace: "easy",  notes: "Warm up, easy effort" },
      { day: "Tue", type: "Intervals", miles: +(2 + w * 0.2).toFixed(1),   pace: "fast",  notes: `${4 + w} × 400m at 5K pace, 90s rest` },
      { day: "Wed", type: "Rest",      miles: 0,                            pace: "—",     notes: "Rest or cross-train" },
      { day: "Thu", type: "Tempo",     miles: +(2.5 + w * 0.3).toFixed(1), pace: "tempo", notes: "20–30 min at comfortably hard pace" },
      { day: "Fri", type: "Rest",      miles: 0,                            pace: "—",     notes: "Rest day" },
      { day: "Sat", type: "Long Run",  miles: +(4 + w * 0.5).toFixed(1),   pace: "easy",  notes: "Long slow distance" },
      { day: "Sun", type: "Rest",      miles: 0,                            pace: "—",     notes: "Recovery day" },
    ]
  })),
  "10K Foundation": Array.from({ length: 10 }, (_, w) => ({
    week: w + 1,
    days: [
      { day: "Mon", type: "Easy Run",  miles: +(3 + w * 0.3).toFixed(1),   pace: "easy",  notes: "Easy conversational pace" },
      { day: "Tue", type: "Tempo",     miles: +(2 + w * 0.2).toFixed(1),   pace: "tempo", notes: "Comfortably hard, 20–30 min" },
      { day: "Wed", type: "Rest",      miles: 0,                            pace: "—",     notes: "Rest or yoga" },
      { day: "Thu", type: "Intervals", miles: +(2.5 + w * 0.2).toFixed(1), pace: "fast",  notes: `${3 + w} × 800m at 10K pace` },
      { day: "Fri", type: "Rest",      miles: 0,                            pace: "—",     notes: "Rest day" },
      { day: "Sat", type: "Long Run",  miles: +(5 + w * 0.5).toFixed(1),   pace: "easy",  notes: "Weekly long run, keep it easy" },
      { day: "Sun", type: "Easy Run",  miles: +(2 + w * 0.1).toFixed(1),   pace: "easy",  notes: "Short recovery run" },
    ]
  })),
  "Half Marathon Prep": Array.from({ length: 14 }, (_, w) => ({
    week: w + 1,
    days: [
      { day: "Mon", type: "Rest",      miles: 0,                            pace: "—",     notes: "Rest day" },
      { day: "Tue", type: "Easy Run",  miles: +(4 + w * 0.3).toFixed(1),   pace: "easy",  notes: "Easy recovery run" },
      { day: "Wed", type: "Tempo",     miles: +(3 + w * 0.25).toFixed(1),  pace: "tempo", notes: "Tempo intervals or steady tempo" },
      { day: "Thu", type: "Easy Run",  miles: +(3 + w * 0.2).toFixed(1),   pace: "easy",  notes: "Easy effort, keep HR low" },
      { day: "Fri", type: "Rest",      miles: 0,                            pace: "—",     notes: "Rest or light cross-train" },
      { day: "Sat", type: "Long Run",  miles: +(6 + w * 0.7).toFixed(1),   pace: "easy",  notes: "Most important run of the week" },
      { day: "Sun", type: "Easy Run",  miles: +(3 + w * 0.1).toFixed(1),   pace: "easy",  notes: "Short shakeout run" },
    ]
  })),
};

function parsePaceToSeconds(p) {
  const [m, s] = p.split(":").map(Number);
  return m * 60 + (s || 0);
}
function secsToPace(s) {
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function buildCustomPlan(distanceMiles, goalPaceStr) {
  const gps = parsePaceToSeconds(goalPaceStr);
  const easy = gps * 1.3, tempo = gps * 1.08, interval = gps * 0.95, longPace = gps * 1.35;
  const numWeeks = distanceMiles <= 3.1 ? 8 : distanceMiles <= 6.2 ? 10 : 14;
  const peakLong = distanceMiles * 1.1;
  return Array.from({ length: numWeeks }, (_, w) => {
    const prog = w / Math.max(numWeeks - 1, 1);
    const isTaper = w >= numWeeks - 2;
    const longMiles = +(distanceMiles * 0.5 + peakLong * 0.5 * prog).toFixed(1);
    const easyMiles = +(distanceMiles * 0.3 + 2 * prog).toFixed(1);
    const tempoMiles = +(2 + distanceMiles * 0.15 * prog).toFixed(1);
    return {
      week: w + 1,
      label: isTaper ? (w === numWeeks - 1 ? "🎯 Race Week" : "🏁 Taper Week") : `Week ${w + 1}`,
      days: [
        { day: "Mon", type: "Rest",      miles: 0, pace: "—", notes: "Rest day" },
        { day: "Tue", type: "Easy Run",  miles: isTaper ? +(easyMiles * 0.6).toFixed(1) : easyMiles, pace: secsToPace(easy) + "/mi", notes: "Conversational pace" },
        { day: "Wed", type: "Tempo",     miles: isTaper ? +(tempoMiles * 0.5).toFixed(1) : tempoMiles, pace: secsToPace(tempo) + "/mi", notes: "Comfortably hard effort" },
        { day: "Thu", type: "Intervals", miles: +(easyMiles * 0.8).toFixed(1), pace: secsToPace(interval) + "/mi", notes: `${3 + w} × 400m at goal pace` },
        { day: "Fri", type: "Rest",      miles: 0, pace: "—", notes: "Rest or stretch" },
        { day: "Sat", type: isTaper ? "Easy Run" : "Long Run", miles: isTaper ? +(longMiles * 0.5).toFixed(1) : longMiles, pace: secsToPace(longPace) + "/mi", notes: isTaper ? "Short shakeout" : "Slow and steady!" },
        { day: "Sun", type: "Rest",      miles: 0, pace: "—", notes: "Recovery day" },
      ]
    };
  });
}

const PRESET_PLANS = [
  { name: "Couch to 5K",        weeks: 9,  level: "Beginner",     emoji: "🌱", desc: "Run your first 5K with walk/run intervals" },
  { name: "5K Speed Builder",   weeks: 6,  level: "Intermediate", emoji: "⚡", desc: "Break your PR with tempo runs & intervals" },
  { name: "10K Foundation",     weeks: 10, level: "Intermediate", emoji: "🔥", desc: "Build endurance to comfortably race 10K" },
  { name: "Half Marathon Prep", weeks: 14, level: "Advanced",     emoji: "🏅", desc: "Full structured half marathon training" },
];
const levelColor = { Beginner: "#A8E6CF", Intermediate: "#FFE66D", Advanced: "#FF6B35" };
const levelBg    = { Beginner: "rgba(168,230,207,0.16)", Intermediate: "rgba(255,230,109,0.16)", Advanced: "rgba(255,107,53,0.16)" };
const typeColor  = { "Easy Run": "#4ECDC4", Tempo: "#FFE66D", Intervals: "#FF6B35", "Long Run": "#C9A4F0", "Walk/Run": "#A8E6CF", Rest: "rgba(255,255,255,0.18)" };

export default function PlansTab({ color, userId, onPlanActivated }) {
  const [expandedPlan, setExpandedPlan]   = useState(null);
  const [expandedWeek, setExpandedWeek]   = useState(null);
  const [activating, setActivating]       = useState(null);
  const [showCustom, setShowCustom]       = useState(false);
  const [customDist, setCustomDist]       = useState("");
  const [customPace, setCustomPace]       = useState("");
  const [customPlan, setCustomPlan]       = useState(null);
  const [customName, setCustomName]       = useState("");
  const [saving, setSaving]               = useState(false);
  const [successMsg, setSuccessMsg]       = useState("");

  const inp = { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box", fontFamily: "Georgia, serif" };

  async function activatePlan(planName) {
    setActivating(planName);
    const schedule = PLAN_SCHEDULES[planName] || [];
    const today = new Date();
    const toInsert = [];
    schedule.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        if (day.type === "Rest" || day.miles === 0) return;
        const d = new Date(today);
        d.setDate(today.getDate() + wi * 7 + di);
        toInsert.push({ user_id: userId, date: d.toISOString().split("T")[0], type: day.type, miles: day.miles, time: "", notes: `[${planName} — Week ${wi + 1}] ${day.notes}`, completed: false });
      });
    });
    if (toInsert.length) await supabase.from("runs").insert(toInsert);
    setActivating(null);
    setSuccessMsg(`✅ ${planName} added to your Training tab!`);
    setTimeout(() => setSuccessMsg(""), 4000);
    if (onPlanActivated) onPlanActivated();
  }

  function generateCustom() {
    if (!customDist || !customPace || !customPace.includes(":")) return;
    const miles = parseFloat(customDist);
    if (isNaN(miles) || miles <= 0) return;
    setCustomPlan(buildCustomPlan(miles, customPace));
    setCustomName(`${customDist} mi Goal Plan`);
  }

  async function saveCustom() {
    if (!customPlan) return;
    setSaving(true);
    const today = new Date();
    const toInsert = [];
    customPlan.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        if (day.type === "Rest" || day.miles === 0) return;
        const d = new Date(today);
        d.setDate(today.getDate() + wi * 7 + di);
        toInsert.push({ user_id: userId, date: d.toISOString().split("T")[0], type: day.type, miles: day.miles, time: "", notes: `[${customName} — ${week.label}] ${day.notes} | Target: ${day.pace}`, completed: false });
      });
    });
    if (toInsert.length) await supabase.from("runs").insert(toInsert);
    setSaving(false);
    setSuccessMsg(`✅ ${customName} added to your Training tab!`);
    setCustomPlan(null); setShowCustom(false);
    setTimeout(() => setSuccessMsg(""), 4000);
    if (onPlanActivated) onPlanActivated();
  }

  function WeekRows({ weeks, prefix }) {
    return weeks.map((week, wi) => {
      const key = `${prefix}-${wi}`;
      const isOpen = expandedWeek === key;
      const total = week.days.reduce((s, d) => s + d.miles, 0).toFixed(1);
      return (
        <div key={key} style={{ marginBottom: 7 }}>
          <div onClick={() => setExpandedWeek(isOpen ? null : key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: "bold" }}>{week.label || `Week ${week.week}`}</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 12, opacity: 0.55 }}>{total} mi</div>
              <div style={{ opacity: 0.35 }}>{isOpen ? "▲" : "▼"}</div>
            </div>
          </div>
          {isOpen && (
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "0 0 10px 10px", padding: "6px 14px 10px" }}>
              {week.days.map((day, di) => (
                <div key={di} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: di < 6 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ width: 32, fontSize: 11, fontWeight: "bold", opacity: 0.45, paddingTop: 2, flexShrink: 0 }}>{day.day}</div>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor[day.type] || "#fff", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: day.type === "Rest" ? "normal" : "bold", opacity: day.type === "Rest" ? 0.4 : 1 }}>{day.type}</span>
                      {day.miles > 0 && <span style={{ fontSize: 12, color: typeColor[day.type] || color, fontWeight: "bold" }}>{day.miles} mi</span>}
                    </div>
                    {day.miles > 0 && <div style={{ fontSize: 11, opacity: 0.45, marginTop: 1 }}>⏱ {day.pace}</div>}
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2, lineHeight: 1.4 }}>{day.notes}</div>
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

      {PRESET_PLANS.map((plan, i) => {
        const isExp = expandedPlan === plan.name;
        return (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 13, overflow: "hidden" }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 28 }}>{plan.emoji}</div>
                <div style={{ background: levelBg[plan.level], color: levelColor[plan.level], borderRadius: 8, padding: "3px 9px", fontSize: 10, fontWeight: "bold" }}>{plan.level}</div>
              </div>
              <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 3 }}>{plan.name}</div>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>{plan.desc}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 12, opacity: 0.4 }}>📅 {plan.weeks} weeks</div>
                <button onClick={() => { setExpandedPlan(isExp ? null : plan.name); setExpandedWeek(null); }} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 9, padding: "7px 13px", color: "#f0ece4", cursor: "pointer", fontSize: 12 }}>
                  {isExp ? "Hide ▲" : "View Schedule ▼"}
                </button>
                <button onClick={() => activatePlan(plan.name)} disabled={activating === plan.name} style={{ background: color, border: "none", borderRadius: 9, padding: "7px 13px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 12 }}>
                  {activating === plan.name ? "Adding..." : "Start Plan →"}
                </button>
              </div>
            </div>
            {isExp && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
                <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.45, textTransform: "uppercase", marginBottom: 10 }}>Week-by-Week Schedule</div>
                <WeekRows weeks={PLAN_SCHEDULES[plan.name]} prefix={plan.name} />
              </div>
            )}
          </div>
        );
      })}

      {/* Custom plan builder */}
      <div style={{ background: `${color}0a`, border: `1px solid ${color}25`, borderRadius: 16, overflow: "hidden", marginTop: 6 }}>
        <div onClick={() => setShowCustom(!showCustom)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: 26 }}>🛠️</div>
            <div style={{ fontWeight: "bold", fontSize: 15, marginTop: 7 }}>Build My Own Plan</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 3 }}>Enter your race distance & goal pace</div>
          </div>
          <div style={{ opacity: 0.35, fontSize: 18 }}>{showCustom ? "▲" : "▼"}</div>
        </div>
        {showCustom && (
          <div style={{ borderTop: `1px solid ${color}20`, padding: "14px 16px" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>RACE DISTANCE (miles)</div>
              <input value={customDist} onChange={e => setCustomDist(e.target.value)} placeholder="3.1 = 5K · 6.2 = 10K · 13.1 = Half" style={inp} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>GOAL RACE PACE (per mile)</div>
              <input value={customPace} onChange={e => setCustomPace(e.target.value)} placeholder="e.g. 9:30" style={inp} />
              <div style={{ fontSize: 10, opacity: 0.38, marginTop: 3 }}>Format: MM:SS per mile</div>
            </div>
            <button onClick={generateCustom} style={{ width: "100%", background: color, border: "none", borderRadius: 10, padding: 12, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>
              Generate My Plan ✨
            </button>

            {customPlan && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: "bold" }}>{customName}</div>
                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{customPlan.length} weeks · personalized paces</div>
                  </div>
                  <button onClick={saveCustom} disabled={saving} style={{ background: color, border: "none", borderRadius: 10, padding: "9px 14px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                    {saving ? "Saving..." : "Add to Calendar →"}
                  </button>
                </div>

                {/* Pace key */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, opacity: 0.45, letterSpacing: 1, marginBottom: 8 }}>YOUR PERSONALIZED PACES</div>
                  {[
                    { label: "Easy runs",      pace: secsToPace(parsePaceToSeconds(customPace) * 1.3),  c: "#4ECDC4" },
                    { label: "Tempo runs",     pace: secsToPace(parsePaceToSeconds(customPace) * 1.08), c: "#FFE66D" },
                    { label: "Intervals",      pace: secsToPace(parsePaceToSeconds(customPace) * 0.95), c: "#FF6B35" },
                    { label: "Long runs",      pace: secsToPace(parsePaceToSeconds(customPace) * 1.35), c: "#C9A4F0" },
                    { label: "Goal race pace", pace: customPace,                                         c: color },
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: p.c }} />{p.label}</div>
                      <div style={{ color: p.c, fontWeight: "bold" }}>{p.pace}/mi</div>
                    </div>
                  ))}
                </div>

                <WeekRows weeks={customPlan} prefix="custom" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}