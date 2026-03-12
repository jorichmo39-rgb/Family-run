import { useState } from "react";
import { supabase } from "./supabase";

// ─── PLAN DATA ────────────────────────────────────────────────────────────────

const PLAN_SCHEDULES = {
  "Couch to 5K": {
    weeks: Array.from({ length: 9 }, (_, w) => ({
      week: w + 1,
      days: [
        { day: "Mon", type: w < 3 ? "Walk/Run" : w < 6 ? "Easy Run" : "Easy Run", miles: +(1 + w * 0.3).toFixed(1), pace: "conversational", notes: w < 3 ? "Run 1 min, walk 2 min x6" : w < 6 ? "Run 10–20 min easy" : "Run 25–30 min easy" },
        { day: "Tue", type: "Rest", miles: 0, pace: "—", notes: "Rest or light stretching" },
        { day: "Wed", type: w < 3 ? "Walk/Run" : "Easy Run", miles: +(1 + w * 0.3).toFixed(1), pace: "conversational", notes: w < 3 ? "Run 1.5 min, walk 2 min x5" : "Repeat Monday's workout" },
        { day: "Thu", type: "Rest", miles: 0, pace: "—", notes: "Rest day" },
        { day: "Fri", type: w < 3 ? "Walk/Run" : "Easy Run", miles: +(1.2 + w * 0.3).toFixed(1), pace: "conversational", notes: w < 3 ? "Run 2 min, walk 1.5 min x5" : "Slightly longer easy run" },
        { day: "Sat", type: "Rest", miles: 0, pace: "—", notes: "Rest or walk" },
        { day: "Sun", type: "Rest", miles: 0, pace: "—", notes: "Rest day" },
      ]
    }))
  },
  "5K Speed Builder": {
    weeks: Array.from({ length: 6 }, (_, w) => ({
      week: w + 1,
      days: [
        { day: "Mon", type: "Easy Run",   miles: +(3 + w * 0.2).toFixed(1), pace: "easy",   notes: "Warm up, easy effort" },
        { day: "Tue", type: "Intervals",  miles: +(2 + w * 0.2).toFixed(1), pace: "fast",   notes: `${4 + w} x 400m at 5K pace with 90s rest` },
        { day: "Wed", type: "Rest",       miles: 0,                          pace: "—",      notes: "Rest or cross-train" },
        { day: "Thu", type: "Tempo",      miles: +(2.5 + w * 0.3).toFixed(1), pace: "tempo", notes: "20–30 min at comfortably hard pace" },
        { day: "Fri", type: "Rest",       miles: 0,                          pace: "—",      notes: "Rest day" },
        { day: "Sat", type: "Long Run",   miles: +(4 + w * 0.5).toFixed(1), pace: "easy",   notes: "Long slow run, conversational pace" },
        { day: "Sun", type: "Rest",       miles: 0,                          pace: "—",      notes: "Recovery day" },
      ]
    }))
  },
  "10K Foundation": {
    weeks: Array.from({ length: 10 }, (_, w) => ({
      week: w + 1,
      days: [
        { day: "Mon", type: "Easy Run",  miles: +(3 + w * 0.3).toFixed(1), pace: "easy",   notes: "Easy conversational pace" },
        { day: "Tue", type: "Tempo",     miles: +(2 + w * 0.2).toFixed(1), pace: "tempo",  notes: "Comfortably hard, 20–30 min" },
        { day: "Wed", type: "Rest",      miles: 0,                          pace: "—",      notes: "Rest or yoga" },
        { day: "Thu", type: "Intervals", miles: +(2.5 + w * 0.2).toFixed(1), pace: "fast", notes: `${3 + w} x 800m at 10K pace` },
        { day: "Fri", type: "Rest",      miles: 0,                          pace: "—",      notes: "Rest day" },
        { day: "Sat", type: "Long Run",  miles: +(5 + w * 0.5).toFixed(1), pace: "easy",   notes: "Weekly long run, keep it easy" },
        { day: "Sun", type: "Easy Run",  miles: +(2 + w * 0.1).toFixed(1), pace: "easy",   notes: "Short recovery run" },
      ]
    }))
  },
  "Half Marathon Prep": {
    weeks: Array.from({ length: 14 }, (_, w) => ({
      week: w + 1,
      days: [
        { day: "Mon", type: "Rest",      miles: 0,                           pace: "—",      notes: "Rest day" },
        { day: "Tue", type: "Easy Run",  miles: +(4 + w * 0.3).toFixed(1),  pace: "easy",   notes: "Easy recovery run" },
        { day: "Wed", type: "Tempo",     miles: +(3 + w * 0.25).toFixed(1), pace: "tempo",  notes: "Tempo intervals or steady tempo" },
        { day: "Thu", type: "Easy Run",  miles: +(3 + w * 0.2).toFixed(1),  pace: "easy",   notes: "Easy effort, keep HR low" },
        { day: "Fri", type: "Rest",      miles: 0,                           pace: "—",      notes: "Rest or light cross-train" },
        { day: "Sat", type: "Long Run",  miles: +(6 + w * 0.7).toFixed(1),  pace: "easy",   notes: "The most important run of the week" },
        { day: "Sun", type: "Easy Run",  miles: +(3 + w * 0.1).toFixed(1),  pace: "easy",   notes: "Short shakeout run" },
      ]
    }))
  },
};

// ─── PACE HELPERS ─────────────────────────────────────────────────────────────

function parsePaceToSeconds(paceStr) {
  // expects "MM:SS" format
  const [min, sec] = paceStr.split(":").map(Number);
  return min * 60 + sec;
}

function secondsToPace(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildCustomPlan(distanceMiles, goalPaceStr) {
  const goalPaceSecs = parsePaceToSeconds(goalPaceStr);
  const easyPaceSecs = goalPaceSecs * 1.3;
  const tempoPaceSecs = goalPaceSecs * 1.08;
  const intervalPaceSecs = goalPaceSecs * 0.95;
  const longRunPaceSecs = goalPaceSecs * 1.35;

  const isShort = distanceMiles <= 3.1;
  const isMedium = distanceMiles <= 6.2;
  const numWeeks = isShort ? 8 : isMedium ? 10 : 14;
  const peakLong = distanceMiles * 1.1;

  return Array.from({ length: numWeeks }, (_, w) => {
    const progress = w / (numWeeks - 1);
    const longMiles = +(distanceMiles * 0.5 + peakLong * 0.5 * progress).toFixed(1);
    const easyMiles = +(distanceMiles * 0.3 + 2 * progress).toFixed(1);
    const tempoMiles = +(2 + distanceMiles * 0.15 * progress).toFixed(1);
    const isTaper = w >= numWeeks - 2;

    return {
      week: w + 1,
      label: isTaper ? "🏁 Taper Week" : w === numWeeks - 1 ? "🎯 Race Week" : `Week ${w + 1}`,
      days: [
        { day: "Mon", type: "Rest",      miles: 0,          pace: "—",              notes: "Rest day" },
        { day: "Tue", type: "Easy Run",  miles: isTaper ? +(easyMiles * 0.6).toFixed(1) : easyMiles, pace: secondsToPace(easyPaceSecs) + "/mi", notes: "Keep it easy, conversational" },
        { day: "Wed", type: "Tempo",     miles: isTaper ? +(tempoMiles * 0.5).toFixed(1) : tempoMiles, pace: secondsToPace(tempoPaceSecs) + "/mi", notes: "Comfortably hard, steady effort" },
        { day: "Thu", type: "Intervals", miles: +(easyMiles * 0.8).toFixed(1), pace: secondsToPace(intervalPaceSecs) + "/mi", notes: `${3 + w} x 400m at goal pace` },
        { day: "Fri", type: "Rest",      miles: 0,          pace: "—",              notes: "Rest or light stretching" },
        { day: "Sat", type: isTaper ? "Easy Run" : "Long Run", miles: isTaper ? +(longMiles * 0.5).toFixed(1) : longMiles, pace: secondsToPace(longRunPaceSecs) + "/mi", notes: isTaper ? "Short shakeout run" : "Most important run of the week — go slow!" },
        { day: "Sun", type: "Rest",      miles: 0,          pace: "—",              notes: "Recovery day" },
      ]
    };
  });
}

// ─── PLANS COMPONENT ──────────────────────────────────────────────────────────

const PRESET_PLANS = [
  { name: "Couch to 5K",        weeks: 9,  level: "Beginner",    emoji: "🌱", desc: "Run your first 5K from scratch with walk/run intervals" },
  { name: "5K Speed Builder",   weeks: 6,  level: "Intermediate", emoji: "⚡", desc: "Break your personal record with tempo runs & intervals" },
  { name: "10K Foundation",     weeks: 10, level: "Intermediate", emoji: "🔥", desc: "Build endurance to comfortably race 10K" },
  { name: "Half Marathon Prep", weeks: 14, level: "Advanced",     emoji: "🏅", desc: "Full structured training for your half marathon goal" },
];

const levelColor = { Beginner: "#A8E6CF", Intermediate: "#FFE66D", Advanced: "#FF6B35" };
const levelBg    = { Beginner: "rgba(168,230,207,0.16)", Intermediate: "rgba(255,230,109,0.16)", Advanced: "rgba(255,107,53,0.16)" };
const typeColor  = { "Easy Run": "#4ECDC4", Tempo: "#FFE66D", Intervals: "#FF6B35", "Long Run": "#C9A4F0", "Walk/Run": "#A8E6CF", Rest: "rgba(255,255,255,0.2)" };

export default function PlansTab({ color, userId, onPlanActivated }) {
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [activating, setActivating] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customDistance, setCustomDistance] = useState("");
  const [customPace, setCustomPace] = useState("");
  const [customPlan, setCustomPlan] = useState(null);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const inp = { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 14, boxSizing: "border-box", fontFamily: "Georgia, serif" };

  async function activatePlan(planName, weeks) {
    setActivating(planName);
    const schedule = PLAN_SCHEDULES[planName]?.weeks || [];
    const today = new Date();
    const runsToInsert = [];

    schedule.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        if (day.type === "Rest" || day.miles === 0) return;
        const d = new Date(today);
        d.setDate(today.getDate() + wi * 7 + di);
        runsToInsert.push({
          user_id: userId,
          date: d.toISOString().split("T")[0],
          type: day.type,
          miles: day.miles,
          time: "",
          notes: `[${planName} — Week ${wi + 1}] ${day.notes}`,
        });
      });
    });

    if (runsToInsert.length > 0) {
      await supabase.from("runs").insert(runsToInsert);
    }

    setActivating(null);
    setSuccessMsg(`✅ ${planName} added to your training calendar!`);
    setTimeout(() => setSuccessMsg(""), 4000);
    if (onPlanActivated) onPlanActivated();
  }

  function generateCustomPlan() {
    if (!customDistance || !customPace) return;
    const miles = parseFloat(customDistance);
    if (isNaN(miles) || miles <= 0) return;
    if (!customPace.includes(":")) return;
    const plan = buildCustomPlan(miles, customPace);
    setCustomPlan(plan);
    setCustomName(`${customDistance} mi Goal Plan`);
  }

  async function saveCustomPlan() {
    if (!customPlan) return;
    setSaving(true);
    const today = new Date();
    const runsToInsert = [];

    customPlan.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        if (day.type === "Rest" || day.miles === 0) return;
        const d = new Date(today);
        d.setDate(today.getDate() + wi * 7 + di);
        runsToInsert.push({
          user_id: userId,
          date: d.toISOString().split("T")[0],
          type: day.type,
          miles: day.miles,
          time: "",
          notes: `[${customName} — ${week.label}] ${day.notes} — Target: ${day.pace}`,
        });
      });
    });

    if (runsToInsert.length > 0) {
      await supabase.from("runs").insert(runsToInsert);
    }

    setSaving(false);
    setSuccessMsg(`✅ ${customName} added to your training calendar!`);
    setCustomPlan(null);
    setShowCustom(false);
    setTimeout(() => setSuccessMsg(""), 4000);
    if (onPlanActivated) onPlanActivated();
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, textTransform: "uppercase" }}>Training Plans</div>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>Find Your Program</div>
      </div>

      {successMsg && (
        <div style={{ background: "rgba(168,230,207,0.15)", border: "1px solid rgba(168,230,207,0.4)", borderRadius: 12, padding: "12px 16px", marginBottom: 18, fontSize: 14, color: "#A8E6CF" }}>
          {successMsg}
        </div>
      )}

      {/* Pre-built plans */}
      {PRESET_PLANS.map((plan, i) => {
        const isExpanded = expandedPlan === plan.name;
        const schedule = PLAN_SCHEDULES[plan.name]?.weeks || [];
        return (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 14, overflow: "hidden" }}>
            {/* Plan header */}
            <div style={{ padding: 17 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                <div style={{ fontSize: 28 }}>{plan.emoji}</div>
                <div style={{ background: levelBg[plan.level], color: levelColor[plan.level], borderRadius: 8, padding: "3px 9px", fontSize: 10, fontWeight: "bold" }}>{plan.level}</div>
              </div>
              <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 13, opacity: 0.62, marginBottom: 13 }}>{plan.desc}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 12, opacity: 0.42 }}>📅 {plan.weeks} weeks</div>
                <button onClick={() => { setExpandedPlan(isExpanded ? null : plan.name); setExpandedWeek(null); }} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "7px 14px", color: "#f0ece4", cursor: "pointer", fontSize: 12 }}>
                  {isExpanded ? "Hide Schedule ▲" : "View Schedule ▼"}
                </button>
                <button
                  onClick={() => activatePlan(plan.name, plan.weeks)}
                  disabled={activating === plan.name}
                  style={{ background: color, border: "none", borderRadius: 10, padding: "7px 14px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 12 }}
                >
                  {activating === plan.name ? "Adding..." : "Start Plan →"}
                </button>
              </div>
            </div>

            {/* Week-by-week schedule */}
            {isExpanded && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 17px" }}>
                <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Week-by-Week Schedule</div>
                {schedule.map((week, wi) => {
                  const isWeekOpen = expandedWeek === wi;
                  const totalMiles = week.days.reduce((s, d) => s + d.miles, 0).toFixed(1);
                  return (
                    <div key={wi} style={{ marginBottom: 8 }}>
                      <div onClick={() => setExpandedWeek(isWeekOpen ? null : wi)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                        <div style={{ fontSize: 13, fontWeight: "bold" }}>Week {week.week}</div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ fontSize: 12, opacity: 0.55 }}>{totalMiles} mi total</div>
                          <div style={{ opacity: 0.35, fontSize: 13 }}>{isWeekOpen ? "▲" : "▼"}</div>
                        </div>
                      </div>
                      {isWeekOpen && (
                        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "0 0 10px 10px", padding: "8px 14px" }}>
                          {week.days.map((day, di) => (
                            <div key={di} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: di < 6 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                              <div style={{ width: 32, fontSize: 11, fontWeight: "bold", opacity: 0.5, paddingTop: 1, flexShrink: 0 }}>{day.day}</div>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor[day.type] || "#fff", marginTop: 4, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div style={{ fontSize: 13, fontWeight: day.type === "Rest" ? "normal" : "bold", opacity: day.type === "Rest" ? 0.4 : 1 }}>{day.type}</div>
                                  {day.miles > 0 && <div style={{ fontSize: 12, color: typeColor[day.type] || color, fontWeight: "bold" }}>{day.miles} mi</div>}
                                </div>
                                {day.miles > 0 && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>⏱ {day.pace}</div>}
                                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 3, lineHeight: 1.4 }}>{day.notes}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Custom plan builder */}
      <div style={{ background: `${color}0a`, border: `1px solid ${color}25`, borderRadius: 16, overflow: "hidden", marginTop: 8 }}>
        <div onClick={() => setShowCustom(!showCustom)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 17, cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: 28 }}>🛠️</div>
            <div style={{ fontWeight: "bold", fontSize: 16, marginTop: 8 }}>Build My Own Plan</div>
            <div style={{ fontSize: 13, opacity: 0.62, marginTop: 4 }}>Enter your race distance & goal pace for a personalized plan</div>
          </div>
          <div style={{ opacity: 0.35, fontSize: 18 }}>{showCustom ? "▲" : "▼"}</div>
        </div>

        {showCustom && (
          <div style={{ borderTop: `1px solid ${color}20`, padding: "16px 17px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>RACE DISTANCE (miles)</div>
              <input value={customDistance} onChange={e => setCustomDistance(e.target.value)} placeholder="e.g. 3.1 for 5K, 6.2 for 10K, 13.1 for Half" style={inp} />
              <div style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>5K = 3.1 · 10K = 6.2 · Half = 13.1 · Full = 26.2</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>GOAL RACE PACE (per mile)</div>
              <input value={customPace} onChange={e => setCustomPace(e.target.value)} placeholder="e.g. 9:30" style={inp} />
              <div style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>Format: MM:SS — e.g. 9:30 means 9 min 30 sec per mile</div>
            </div>
            <button onClick={generateCustomPlan} style={{ width: "100%", background: color, border: "none", borderRadius: 10, padding: 12, color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>
              Generate My Plan ✨
            </button>

            {/* Generated custom plan preview */}
            {customPlan && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: "bold" }}>{customName}</div>
                    <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{customPlan.length} weeks · personalized paces</div>
                  </div>
                  <button onClick={saveCustomPlan} disabled={saving} style={{ background: color, border: "none", borderRadius: 10, padding: "9px 16px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                    {saving ? "Saving..." : "Add to Calendar →"}
                  </button>
                </div>

                {/* Pace key */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 1, marginBottom: 8 }}>YOUR PERSONALIZED PACES</div>
                  {[
                    { label: "Easy runs",     pace: secondsToPace(parsePaceToSeconds(customPace) * 1.3),  color: "#4ECDC4" },
                    { label: "Tempo runs",    pace: secondsToPace(parsePaceToSeconds(customPace) * 1.08), color: "#FFE66D" },
                    { label: "Intervals",     pace: secondsToPace(parsePaceToSeconds(customPace) * 0.95), color: "#FF6B35" },
                    { label: "Long runs",     pace: secondsToPace(parsePaceToSeconds(customPace) * 1.35), color: "#C9A4F0" },
                    { label: "Goal race pace",pace: customPace,                                            color: color },
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                        {p.label}
                      </div>
                      <div style={{ color: p.color, fontWeight: "bold" }}>{p.pace}/mi</div>
                    </div>
                  ))}
                </div>

                {/* Week previews */}
                {customPlan.map((week, wi) => {
                  const isWeekOpen = expandedWeek === `custom-${wi}`;
                  const totalMiles = week.days.reduce((s, d) => s + d.miles, 0).toFixed(1);
                  return (
                    <div key={wi} style={{ marginBottom: 8 }}>
                      <div onClick={() => setExpandedWeek(isWeekOpen ? null : `custom-${wi}`)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                        <div style={{ fontSize: 13, fontWeight: "bold" }}>{week.label}</div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ fontSize: 12, opacity: 0.55 }}>{totalMiles} mi</div>
                          <div style={{ opacity: 0.35, fontSize: 13 }}>{isWeekOpen ? "▲" : "▼"}</div>
                        </div>
                      </div>
                      {isWeekOpen && (
                        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "0 0 10px 10px", padding: "8px 14px" }}>
                          {week.days.map((day, di) => (
                            <div key={di} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: di < 6 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                              <div style={{ width: 32, fontSize: 11, fontWeight: "bold", opacity: 0.5, paddingTop: 1, flexShrink: 0 }}>{day.day}</div>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor[day.type] || "#fff", marginTop: 4, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <div style={{ fontSize: 13, fontWeight: day.type === "Rest" ? "normal" : "bold", opacity: day.type === "Rest" ? 0.4 : 1 }}>{day.type}</div>
                                  {day.miles > 0 && <div style={{ fontSize: 12, color: typeColor[day.type] || color, fontWeight: "bold" }}>{day.miles} mi</div>}
                                </div>
                                {day.miles > 0 && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>⏱ {day.pace}</div>}
                                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 3, lineHeight: 1.4 }}>{day.notes}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}