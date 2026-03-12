import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import PlansTab from "./Plans";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const AVATAR_OPTIONS = ["🏃","🏃‍♀️","🧑‍🦱","👧","👦","🧑","👩","👨","🧒","👶"];
const COLOR_OPTIONS  = ["#FF6B35","#4ECDC4","#FFE66D","#C9A4F0","#A8E6CF","#FF8FA3","#7EC8E3","#FFB347"];
const RUN_TYPES      = ["Easy Run","Tempo","Long Run","Intervals","Walk/Run","Race"];
const readinessColor = { "Go Hard":"#A8E6CF","Moderate":"#FFE66D","Easy Day":"#FF6B35","Rest":"#FF4444" };
const readinessIcon  = { "Go Hard":"🚀","Moderate":"💪","Easy Day":"🚶","Rest":"🛌" };
const typeColor      = { "Easy Run":"#4ECDC4",Tempo:"#FFE66D",Intervals:"#FF6B35","Long Run":"#C9A4F0","Walk/Run":"#A8E6CF",Race:"#FF8FA3" };

function getReadiness(sleep, soreness, energy) {
  const score = (sleep/10)*35 + ((10-soreness)/10)*30 + (energy/10)*35;
  if (score >= 75) return "Go Hard";
  if (score >= 58) return "Moderate";
  if (score >= 42) return "Easy Day";
  return "Rest";
}

// ─── MEAL DATA ────────────────────────────────────────────────────────────────
const MEALS = {
  rest: {
    label: "Rest Day",
    calories: "1,800–2,200",
    carbs: "180–220g",
    protein: "120–140g",
    breakfast: { name: "Greek Yogurt Parfait", items: ["1 cup Greek yogurt","½ cup granola","½ cup mixed berries","1 tbsp honey"], why: "Light protein + carbs to start the day without overloading on rest." },
    lunch:     { name: "Chicken & Veggie Bowl", items: ["4oz grilled chicken","1 cup brown rice","1 cup roasted veggies","2 tbsp olive oil dressing"], why: "Balanced macros to maintain muscle and keep energy steady." },
    dinner:    { name: "Salmon & Sweet Potato", items: ["5oz baked salmon","1 medium sweet potato","1 cup steamed broccoli","Lemon + olive oil"], why: "Omega-3s aid recovery and sweet potato replenishes glycogen stores." },
    snack:     { name: "Apple + Almond Butter", items: ["1 medium apple","2 tbsp almond butter"], why: "Healthy fat + natural sugar to keep metabolism active on rest days." },
  },
  easy: {
    label: "Easy Run Day",
    calories: "2,000–2,400",
    carbs: "220–260g",
    protein: "130–150g",
    breakfast: { name: "Oatmeal Power Bowl", items: ["1 cup oats","1 banana","1 tbsp peanut butter","1 cup milk or oat milk","Dash of cinnamon"], why: "Slow-burning carbs give you steady energy for your easy run." },
    lunch:     { name: "Turkey Wrap", items: ["Whole wheat tortilla","4oz turkey","Avocado","Spinach, tomato, mustard"], why: "Lean protein + healthy fat keeps you full and fueled." },
    dinner:    { name: "Pasta with Marinara + Chicken", items: ["2 cups whole wheat pasta","4oz chicken breast","½ cup marinara","Side salad"], why: "Replenish glycogen post-run and prep for tomorrow's workout." },
    snack:     { name: "Cottage Cheese + Pineapple", items: ["½ cup cottage cheese","½ cup pineapple chunks"], why: "Casein protein + natural sugars support overnight muscle recovery." },
  },
  tempo: {
    label: "Tempo / Interval Day",
    calories: "2,300–2,700",
    carbs: "270–310g",
    protein: "140–160g",
    breakfast: { name: "Whole Grain Toast + Eggs + Banana", items: ["2 slices whole grain toast","2 eggs scrambled","1 banana","8oz orange juice"], why: "High carb + protein pre-workout combo. Eat 2 hrs before your run." },
    lunch:     { name: "Rice Bowl with Beans + Chicken", items: ["1.5 cups white rice","4oz chicken","½ cup black beans","Salsa + lime"], why: "Easily digestible carbs to top off glycogen before a hard effort." },
    dinner:    { name: "Beef & Veggie Stir Fry + Rice", items: ["4oz lean beef","2 cups mixed veggies","1.5 cups white rice","Soy sauce + ginger"], why: "Iron from beef helps with oxygen delivery. Carbs refuel after hard work." },
    snack:     { name: "Banana + Energy Gel (pre-run)", items: ["1 banana 1 hr before","1 energy gel 15 min before","16oz water"], why: "Quick fuel for your hard session. Keep it simple and proven." },
  },
  long: {
    label: "Long Run Day",
    calories: "2,600–3,200",
    carbs: "320–380g",
    protein: "150–170g",
    breakfast: { name: "Bagel + Peanut Butter + Banana", items: ["1 plain bagel","2 tbsp peanut butter","1 banana","16oz water or sports drink"], why: "High carb, easy to digest. Eat 2–3 hrs before your long run starts." },
    lunch:     { name: "Post-Run Recovery Smoothie", items: ["1 cup chocolate milk","1 banana","1 scoop protein powder","½ cup oats","1 cup frozen berries"], why: "4:1 carb-to-protein ratio is ideal within 30 min of finishing. Don't skip this!" },
    dinner:    { name: "Loaded Pasta Night", items: ["3 cups whole wheat pasta","5oz ground turkey or chicken","Marinara sauce","Side salad with olive oil","Whole grain bread"], why: "This is your biggest refuel meal. Don't be afraid of the portions — you earned them." },
    snack:     { name: "Dates + Nuts (during run)", items: ["3–4 Medjool dates per hour","Small handful of nuts after","Sports drink or water every 20 min"], why: "Natural fuel mid-run. Aim for 30–60g carbs per hour during runs over 60 min." },
  },
};

function getMealType(runType) {
  if (!runType) return "rest";
  if (runType === "Long Run") return "long";
  if (runType === "Tempo" || runType === "Intervals") return "tempo";
  if (runType === "Easy Run" || runType === "Walk/Run") return "easy";
  return "rest";
}

const NUTRITION_CARDS = [
  { category: "Pre-Run Fuel",     emoji: "⚡", color: "#FF6B35", timing: "1–2 hrs before",  foods: ["Banana with almond butter","Oatmeal with berries","Whole grain toast + honey","Greek yogurt + granola"], tip: "Focus on easily digestible carbs. Avoid high fat or high fiber right before." },
  { category: "During Run",       emoji: "🏃", color: "#4ECDC4", timing: "Runs over 60 min", foods: ["Energy gels every 45 min","Medjool dates","Banana slices","Sports drink (electrolytes)"], tip: "Aim for 30–60g carbs/hour. Hydrate every 15–20 min." },
  { category: "Post-Run Recovery",emoji: "🔄", color: "#A8E6CF", timing: "Within 30–45 min", foods: ["Chocolate milk","Eggs + whole grain toast","Protein smoothie","Chicken + sweet potato"], tip: "4:1 carb-to-protein ratio is ideal. This is your recovery window — don't skip it!" },
  { category: "Daily Fueling",    emoji: "🌿", color: "#FFE66D", timing: "All day",           foods: ["Lean proteins (chicken, fish, beans)","Complex carbs (quinoa, brown rice)","Healthy fats (avocado, nuts)","5+ servings of produce"], tip: "Runners need ~1.4–1.7g protein per kg bodyweight. Eat the rainbow." },
  { category: "Hydration",        emoji: "💧", color: "#7EC8E3", timing: "All day",           foods: ["Water: half your bodyweight in oz/day","Electrolyte drink post-run","Coconut water","Watermelon, cucumber, oranges"], tip: "Urine should be pale yellow. Drink an extra 16oz for every mile you run." },
  { category: "Race Day",         emoji: "🏁", color: "#C9A4F0", timing: "Race morning",      foods: ["Bagel + peanut butter (2–3 hrs out)","Banana (1 hr out)","Energy gel 15 min before","Sports drink at every aid station"], tip: "Never try anything new on race day. Stick to what worked in training." },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [avatar,setAvatar]=useState("🏃");
  const [color,setColor]=useState("#FF6B35");
  const [goal,setGoal]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleSubmit() {
    setError(""); setLoading(true);
    if (mode==="signup") {
      const {data,error:e}=await supabase.auth.signUp({email,password});
      if (e){setError(e.message);setLoading(false);return;}
      if (data.user){await supabase.from("profiles").insert({id:data.user.id,name,avatar,color,goal});onAuth(data.user);}
    } else {
      const {data,error:e}=await supabase.auth.signInWithPassword({email,password});
      if (e){setError(e.message);setLoading(false);return;}
      onAuth(data.user);
    }
    setLoading(false);
  }

  const inp={width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"12px 14px",color:"#f0ece4",fontSize:15,boxSizing:"border-box",fontFamily:"Georgia, serif"};
  return (
    <div style={{fontFamily:"'Georgia',serif",background:"linear-gradient(160deg,#080c14 0%,#111827 50%,#0c0a18 100%)",minHeight:"100vh",color:"#f0ece4",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:10,letterSpacing:5,color:"#FF6B35",textTransform:"uppercase",marginBottom:6}}>Family</div>
      <div style={{fontSize:32,fontWeight:"bold",marginBottom:4}}>Run Together</div>
      <div style={{fontSize:13,opacity:0.5,marginBottom:36}}>Your family training app</div>
      <div style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:24}}>
        <div style={{display:"flex",marginBottom:24,background:"rgba(255,255,255,0.06)",borderRadius:12,padding:4}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",border:"none",borderRadius:10,cursor:"pointer",background:mode===m?"#FF6B35":"transparent",color:mode===m?"#000":"#f0ece4",fontWeight:mode===m?"bold":"normal",fontSize:14,fontFamily:"Georgia, serif"}}>
              {m==="login"?"Sign In":"Create Account"}
            </button>
          ))}
        </div>
        {mode==="signup"&&(
          <>
            <div style={{marginBottom:14}}><div style={{fontSize:11,opacity:0.55,marginBottom:6}}>YOUR NAME</div><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Josh" style={inp}/></div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,opacity:0.55,marginBottom:6}}>PICK AN AVATAR</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {AVATAR_OPTIONS.map(a=><button key={a} onClick={()=>setAvatar(a)} style={{fontSize:24,padding:"6px 8px",borderRadius:10,border:`2px solid ${avatar===a?"#FF6B35":"transparent"}`,background:avatar===a?"rgba(255,107,53,0.2)":"rgba(255,255,255,0.06)",cursor:"pointer"}}>{a}</button>)}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,opacity:0.55,marginBottom:6}}>PICK A COLOR</div>
              <div style={{display:"flex",gap:8}}>
                {COLOR_OPTIONS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:"50%",background:c,border:`3px solid ${color===c?"#fff":"transparent"}`,cursor:"pointer"}}/>)}
              </div>
            </div>
            <div style={{marginBottom:14}}><div style={{fontSize:11,opacity:0.55,marginBottom:6}}>YOUR GOAL</div><input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. Run a 5K, Half Marathon..." style={inp}/></div>
          </>
        )}
        <div style={{marginBottom:14}}><div style={{fontSize:11,opacity:0.55,marginBottom:6}}>EMAIL</div><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" style={inp}/></div>
        <div style={{marginBottom:20}}><div style={{fontSize:11,opacity:0.55,marginBottom:6}}>PASSWORD</div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp}/></div>
        {error&&<div style={{color:"#FF6B35",fontSize:13,marginBottom:14,background:"rgba(255,107,53,0.1)",borderRadius:8,padding:"8px 12px"}}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{width:"100%",background:"#FF6B35",border:"none",borderRadius:12,padding:"14px",color:"#000",fontWeight:"bold",fontSize:16,cursor:"pointer",fontFamily:"Georgia, serif"}}>
          {loading?"Please wait...":mode==="login"?"Sign In →":"Create Account →"}
        </button>
      </div>
    </div>
  );
}

// ─── WEATHER ──────────────────────────────────────────────────────────────────
function WeatherWidget() {
  const [weather,setWeather]=useState(null);
  const [status,setStatus]=useState("loading");
  const fetchedRef=useRef(false);
  useEffect(()=>{
    if(fetchedRef.current)return; fetchedRef.current=true;
    if(!navigator.geolocation){setStatus("error");return;}
    navigator.geolocation.getCurrentPosition(async(pos)=>{
      try{
        const {latitude:lat,longitude:lon}=pos.coords;
        const res=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,uv_index&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`);
        const data=await res.json(); const cur=data.current; const code=cur.weathercode;
        const icon=code===0?"☀️":code<=2?"⛅":code<=48?"☁️":code<=67?"🌧️":code<=77?"❄️":code<=82?"🌦️":"⛈️";
        const cond=code===0?"Clear":code<=2?"Partly Cloudy":code<=48?"Cloudy":code<=67?"Rainy":code<=77?"Snowy":code<=82?"Showers":"Thunderstorm";
        setWeather({temp:Math.round(cur.temperature_2m),condition:cond,wind:Math.round(cur.windspeed_10m),humidity:cur.relativehumidity_2m,uv:Math.round(cur.uv_index||0),icon});
        setStatus("ok");
      }catch{setStatus("error");}
    },()=>setStatus("denied"),{timeout:8000});
  },[]);

  const getOutfit=t=>{
    if(t<32)return{tip:"Heavy layers — thermal top, wind pants, gloves & hat",emoji:"🧤"};
    if(t<45)return{tip:"Long sleeve base + light jacket, gloves recommended",emoji:"🧥"};
    if(t<55)return{tip:"Long sleeve shirt + shorts or light running tights",emoji:"👕"};
    if(t<65)return{tip:"Short sleeve + shorts — perfect running weather!",emoji:"😄"};
    if(t<75)return{tip:"Short sleeve & shorts. Bring water!",emoji:"☀️"};
    return{tip:"Minimal clothing. Early morning run recommended.",emoji:"🥵"};
  };

  if(status==="loading")return<div style={{background:"rgba(100,160,220,0.1)",border:"1px solid rgba(100,160,220,0.2)",borderRadius:20,padding:18,marginBottom:20,textAlign:"center",fontSize:13,opacity:0.6}}>📍 Getting your local weather...</div>;
  if(status!=="ok")return<div style={{background:"rgba(100,160,220,0.08)",border:"1px solid rgba(100,160,220,0.15)",borderRadius:20,padding:14,marginBottom:20,fontSize:12,opacity:0.5,textAlign:"center"}}>{status==="denied"?"📍 Enable location access to see live weather":"⚠️ Weather unavailable"}</div>;

  const outfit=getOutfit(weather.temp);
  return(
    <div style={{background:"linear-gradient(135deg,rgba(100,160,220,0.14),rgba(60,120,200,0.07))",border:"1px solid rgba(100,160,220,0.28)",borderRadius:20,padding:18,marginBottom:20}}>
      <div style={{fontSize:10,letterSpacing:4,color:"#7EC8E3",textTransform:"uppercase",marginBottom:12}}>📍 Live Local Weather</div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
        <div style={{fontSize:48}}>{weather.icon}</div>
        <div><div style={{fontSize:34,fontWeight:"bold",lineHeight:1}}>{weather.temp}°F</div><div style={{fontSize:13,opacity:0.65,marginTop:3}}>{weather.condition}</div></div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:12,opacity:0.6}}>💨 {weather.wind} mph</div>
          <div style={{fontSize:12,opacity:0.6,marginTop:4}}>💧 {weather.humidity}%</div>
          <div style={{fontSize:12,opacity:0.6,marginTop:4}}>☀️ UV {weather.uv}</div>
        </div>
      </div>
      <div style={{background:"rgba(126,200,227,0.1)",border:"1px solid rgba(126,200,227,0.22)",borderRadius:12,padding:11,display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:20}}>{outfit.emoji}</div>
        <div><div style={{fontSize:10,color:"#7EC8E3",letterSpacing:1,marginBottom:2}}>WHAT TO WEAR</div><div style={{fontSize:13,lineHeight:1.5}}>{outfit.tip}</div></div>
      </div>
    </div>
  );
}

// ─── NUTRITION TAB ────────────────────────────────────────────────────────────
function NutritionTab({ color, latestMetric, prevMetric, latestRecovery, weeklyMiles, upcomingLongRun, todayRunType, upcomingRuns }) {
  const [view, setView] = useState("today"); // today | week | guides
  const [expandedCard, setExpandedCard] = useState(null);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0))/86400000);
  const spotlightIdx = dayOfYear % NUTRITION_CARDS.length;

  const todayMeal = MEALS[getMealType(todayRunType)];

  // Weekly meal plan — 7 days based on upcoming schedule
  const weekMeals = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()+i);
    const dStr = d.toISOString().split("T")[0];
    const run = upcomingRuns.find(r=>r.date===dStr);
    const mealType = getMealType(run?.type);
    return { date: dStr, dayLabel: i===0?"Today":i===1?"Tomorrow":d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}), run: run?.type||"Rest", meal: MEALS[mealType] };
  });

  // Personalized recs
  const recs=[];
  if(latestRecovery){
    const r=latestRecovery.readiness;
    if(r==="Rest"||r==="Easy Day")recs.push({emoji:"🔋",color:"#FF6B35",title:"Low Readiness — Fuel Up",body:"Your recovery score is low. Eat carb-rich snacks every 3–4 hours to replenish glycogen. Try oatmeal, rice cakes with honey, or a banana + peanut butter."});
    if(r==="Go Hard")recs.push({emoji:"🚀",color:"#A8E6CF",title:"High Readiness — Load Up!",body:"Your body is primed to perform. Eat a solid carb + protein meal 2 hours before your run. Hit your post-run recovery window within 30 min."});
  }
  if(weeklyMiles>=20)recs.push({emoji:"🍞",color:"#FFE66D",title:`High Mileage Week (${weeklyMiles.toFixed(1)} mi)`,body:"You're running a lot this week. Increase carb intake by 10–20% on high mileage days. Add an extra snack like a banana or rice cakes before bed."});
  if(upcomingLongRun)recs.push({emoji:"🏃",color:"#C9A4F0",title:`Long Run Coming Up (${upcomingLongRun} mi)`,body:"Load up on carbs tonight — pasta, rice, or potatoes at dinner. Hydrate well. Lay out your fuel (gels or dates) tonight so you're ready."});
  if(latestMetric&&prevMetric){
    const delta=latestMetric.weight-prevMetric.weight;
    if(delta>1)recs.push({emoji:"⚖️",color:"#FF8FA3",title:"Weight Trending Up",body:"Focus on lean proteins and vegetables. Reduce processed carbs, increase fiber. Avoid eating back all your run calories unless you're in a heavy training week."});
    if(delta<-1)recs.push({emoji:"⚖️",color:"#4ECDC4",title:"Weight Trending Down",body:"Make sure you're fueling enough for your training. Add calorie-dense nutritious foods: nuts, avocado, whole grains. Under-fueling hurts performance."});
  }

  function MealCard({meal, runLabel}) {
    return(
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontWeight:"bold",fontSize:15}}>{meal.label}</div>
            {runLabel&&<div style={{fontSize:12,color:typeColor[runLabel]||"rgba(255,255,255,0.45)",marginTop:2}}>🏃 {runLabel}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,opacity:0.5}}>~{meal.calories} cal</div>
            <div style={{fontSize:11,opacity:0.5,marginTop:2}}>{meal.carbs} carbs</div>
            <div style={{fontSize:11,opacity:0.5,marginTop:2}}>{meal.protein} protein</div>
          </div>
        </div>
        {[
          {label:"🌅 Breakfast",data:meal.breakfast},
          {label:"☀️ Lunch",data:meal.lunch},
          {label:"🌙 Dinner",data:meal.dinner},
          {label:"🍎 Snack",data:meal.snack},
        ].map((slot,si)=>(
          <div key={si} style={{marginBottom:si<3?12:0}}>
            <div style={{fontSize:12,fontWeight:"bold",color,marginBottom:5}}>{slot.label} — {slot.data.name}</div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:10}}>
              {slot.data.items.map((item,ii)=>(
                <div key={ii} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 0",borderBottom:ii<slot.data.items.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:color,flexShrink:0}}/>
                  <div style={{fontSize:12}}>{item}</div>
                </div>
              ))}
              <div style={{marginTop:8,fontSize:11,opacity:0.6,lineHeight:1.5,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:8}}>💡 {slot.data.why}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return(
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase"}}>Runner's Kitchen</div>
        <div style={{fontSize:20,fontWeight:"bold"}}>Fuel Your Training</div>
      </div>

      {/* View toggle */}
      <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:12,padding:4,marginBottom:18,gap:4}}>
        {[{id:"today",label:"Today's Meals"},{id:"week",label:"Weekly Plan"},{id:"guides",label:"Guides"}].map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{flex:1,padding:"9px 4px",border:"none",borderRadius:9,cursor:"pointer",background:view===v.id?color:"transparent",color:view===v.id?"#000":"#f0ece4",fontWeight:view===v.id?"bold":"normal",fontSize:11,fontFamily:"Georgia, serif"}}>
            {v.label}
          </button>
        ))}
      </div>

      {/* TODAY view */}
      {view==="today"&&(
        <div>
          {recs.length>0&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase",marginBottom:10}}>📊 Personalized For You</div>
              {recs.map((r,i)=>(
                <div key={i} style={{background:`${r.color}10`,border:`1px solid ${r.color}28`,borderRadius:14,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{fontSize:22}}>{r.emoji}</div>
                    <div><div style={{fontWeight:"bold",fontSize:13,color:r.color,marginBottom:4}}>{r.title}</div><div style={{fontSize:12,lineHeight:1.6,opacity:0.85}}>{r.body}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <MealCard meal={todayMeal} runLabel={todayRunType} />
        </div>
      )}

      {/* WEEK view */}
      {view==="week"&&(
        <div>
          <div style={{fontSize:12,opacity:0.55,marginBottom:14,lineHeight:1.6}}>Meals are tailored to each day's workout. Long run days get more carbs. Rest days keep it lighter.</div>
          {weekMeals.map((day,i)=>{
            const isOpen=expandedCard===i;
            return(
              <div key={i} style={{marginBottom:10}}>
                <div onClick={()=>setExpandedCard(isOpen?null:i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"12px 15px",cursor:"pointer"}}>
                  <div>
                    <div style={{fontWeight:"bold",fontSize:14}}>{day.dayLabel}</div>
                    <div style={{fontSize:11,marginTop:2,color:typeColor[day.run]||"rgba(255,255,255,0.4)"}}>{day.run}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:11,opacity:0.45}}>{day.meal.calories} cal</div>
                    <div style={{opacity:0.3}}>{isOpen?"▲":"▼"}</div>
                  </div>
                </div>
                {isOpen&&<div style={{marginTop:8}}><MealCard meal={day.meal} runLabel={day.run==="Rest"?null:day.run}/></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* GUIDES view */}
      {view==="guides"&&(
        <div>
          <div style={{background:`${NUTRITION_CARDS[spotlightIdx].color}15`,border:`1px solid ${NUTRITION_CARDS[spotlightIdx].color}35`,borderRadius:16,padding:14,marginBottom:16}}>
            <div style={{fontSize:10,letterSpacing:3,color:NUTRITION_CARDS[spotlightIdx].color,textTransform:"uppercase",marginBottom:6}}>⭐ Today's Spotlight</div>
            <div style={{display:"flex",gap:12}}>
              <div style={{fontSize:28}}>{NUTRITION_CARDS[spotlightIdx].emoji}</div>
              <div>
                <div style={{fontWeight:"bold",fontSize:14,marginBottom:3}}>{NUTRITION_CARDS[spotlightIdx].category}</div>
                <div style={{fontSize:11,color:NUTRITION_CARDS[spotlightIdx].color,marginBottom:6}}>⏰ {NUTRITION_CARDS[spotlightIdx].timing}</div>
                <div style={{fontSize:12,lineHeight:1.6,background:`${NUTRITION_CARDS[spotlightIdx].color}10`,borderRadius:8,padding:9,borderLeft:`3px solid ${NUTRITION_CARDS[spotlightIdx].color}`}}>💡 {NUTRITION_CARDS[spotlightIdx].tip}</div>
              </div>
            </div>
          </div>
          {NUTRITION_CARDS.map((n,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${n.color}22`,borderRadius:14,marginBottom:10,overflow:"hidden"}}>
              <div onClick={()=>setExpandedCard(expandedCard===`g${i}`?null:`g${i}`)} style={{display:"flex",alignItems:"center",gap:12,padding:14,cursor:"pointer"}}>
                <div style={{width:38,height:38,borderRadius:9,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",background:`${n.color}15`}}>{n.emoji}</div>
                <div style={{flex:1}}><div style={{fontWeight:"bold",fontSize:13}}>{n.category}</div><div style={{fontSize:11,color:n.color,marginTop:2}}>⏰ {n.timing}</div></div>
                <div style={{opacity:0.3}}>{expandedCard===`g${i}`?"▲":"▼"}</div>
              </div>
              {expandedCard===`g${i}`&&(
                <div style={{padding:"0 14px 14px",borderTop:`1px solid ${n.color}12`}}>
                  <div style={{paddingTop:10}}>
                    {n.foods.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:j<n.foods.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{width:5,height:5,borderRadius:"50%",background:n.color,flexShrink:0}}/><div style={{fontSize:13}}>{f}</div></div>)}
                    <div style={{marginTop:10,background:`${n.color}10`,borderRadius:9,padding:10,fontSize:12,lineHeight:1.6,borderLeft:`3px solid ${n.color}`}}>💡 {n.tip}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardTab({ color, currentUserId }) {
  const [board,setBoard]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{loadBoard();},[]);

  async function loadBoard() {
    setLoading(true);
    const {data:profiles}=await supabase.from("profiles").select("id,name,avatar,color");
    if(!profiles){setLoading(false);return;}
    const weekStart=new Date(); weekStart.setDate(weekStart.getDate()-weekStart.getDay()); weekStart.setHours(0,0,0,0);
    const {data:runs}=await supabase.from("runs").select("user_id,miles,date,completed").gte("date",weekStart.toISOString().split("T")[0]);
    const {data:allRuns}=await supabase.from("runs").select("user_id,date,completed").order("date",{ascending:false});
    const entries=profiles.map(p=>{
      const wRuns=(runs||[]).filter(r=>r.user_id===p.id&&r.completed);
      const weekMiles=wRuns.reduce((s,r)=>s+(r.miles||0),0);
      const userRuns=(allRuns||[]).filter(r=>r.user_id===p.id&&r.completed);
      const runDates=[...new Set(userRuns.map(r=>r.date))].sort().reverse();
      let streak=0,checkDate=new Date(); checkDate.setHours(0,0,0,0);
      for(let d of runDates){
        const rd=new Date(d+"T00:00:00");
        const diff=Math.round((checkDate-rd)/86400000);
        if(diff===0||diff===1){streak++;checkDate=rd;}else break;
      }
      return{...p,weekMiles:+weekMiles.toFixed(1),weekCount:wRuns.length,streak};
    });
    entries.sort((a,b)=>b.weekMiles-a.weekMiles||b.streak-a.streak);
    setBoard(entries); setLoading(false);
  }

  const medals=["🥇","🥈","🥉"];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase"}}>Family Leaderboard</div><div style={{fontSize:20,fontWeight:"bold"}}>This Week</div></div>
        <button onClick={loadBoard} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:10,padding:"7px 13px",color:"#f0ece4",cursor:"pointer",fontSize:12}}>↻ Refresh</button>
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 14px",marginBottom:18,fontSize:11,opacity:0.5}}>
        🏆 Ranked by weekly miles · 🔥 Streak = consecutive active days
      </div>
      {loading?<div style={{textAlign:"center",padding:40,opacity:0.4}}>Loading...</div>
        :board.length===0?<div style={{textAlign:"center",padding:40,opacity:0.4}}>No activity yet this week!</div>
        :board.map((entry,i)=>{
          const isMe=entry.id===currentUserId;
          return(
            <div key={entry.id} style={{background:isMe?`${entry.color||color}18`:"rgba(255,255,255,0.04)",border:`1px solid ${isMe?(entry.color||color)+"44":"rgba(255,255,255,0.07)"}`,borderRadius:16,padding:15,marginBottom:11,display:"flex",alignItems:"center",gap:13}}>
              <div style={{fontSize:22,width:30,textAlign:"center"}}>{medals[i]||`${i+1}`}</div>
              <div style={{fontSize:26}}>{entry.avatar}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:"bold",fontSize:15}}>{entry.name}{isMe&&<span style={{fontSize:11,color:entry.color||color,fontWeight:"normal"}}> (you)</span>}</div>
                <div style={{display:"flex",gap:12,marginTop:4}}>
                  <span style={{fontSize:12,opacity:0.6}}>🏃 {entry.weekCount} run{entry.weekCount!==1?"s":""}</span>
                  {entry.streak>0&&<span style={{fontSize:12,color:"#FFE66D"}}>🔥 {entry.streak} day streak</span>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:"bold",color:entry.color||color}}>{entry.weekMiles}</div>
                <div style={{fontSize:11,opacity:0.4}}>miles</div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState("dashboard");
  const [runs,setRuns]=useState([]);
  const [metrics,setMetrics]=useState([]);
  const [recovery,setRecovery]=useState([]);
  const [showLogRun,setShowLogRun]=useState(false);
  const [showAddMetric,setShowAddMetric]=useState(false);
  const [showAddRecovery,setShowAddRecovery]=useState(false);
  const [showEditProfile,setShowEditProfile]=useState(false);
  const [showCompletedRuns,setShowCompletedRuns]=useState(false);
  const [metricView,setMetricView]=useState("weight");
  const [completingId,setCompletingId]=useState(null);
  const [completeForm,setCompleteForm]=useState({time:"",notes:""});
  const [newRun,setNewRun]=useState({type:"Easy Run",miles:"",time:"",notes:"",date:new Date().toISOString().split("T")[0]});
  const [newMetric,setNewMetric]=useState({weight:"",rhr:"",notes:""});
  const [newRecovery,setNewRecovery]=useState({sleep:7,soreness:3,energy:7,notes:""});
  const [editProfile,setEditProfile]=useState({});

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);}
      else setLoading(false);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);}
      else{setUser(null);setProfile(null);setLoading(false);}
    });
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{if(user){loadRuns();loadMetrics();loadRecovery();}},[user]);

  async function loadProfile(uid){const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();setProfile(data);setLoading(false);}
  async function loadRuns(){const{data}=await supabase.from("runs").select("*").eq("user_id",user.id).order("date",{ascending:true});setRuns(data||[]);}
  async function loadMetrics(){const{data}=await supabase.from("metrics").select("*").eq("user_id",user.id).order("created_at",{ascending:true});setMetrics(data||[]);}
  async function loadRecovery(){const{data}=await supabase.from("recovery").select("*").eq("user_id",user.id).order("created_at",{ascending:false});setRecovery(data||[]);}
  async function saveRun(){
    await supabase.from("runs").insert({...newRun,user_id:user.id,miles:parseFloat(newRun.miles),completed:false});
    setNewRun({type:"Easy Run",miles:"",time:"",notes:"",date:new Date().toISOString().split("T")[0]});
    setShowLogRun(false);loadRuns();
  }
  async function deleteRun(id){await supabase.from("runs").delete().eq("id",id);loadRuns();}
  async function markComplete(id){
    await supabase.from("runs").update({completed:true,time:completeForm.time,notes:completeForm.notes||runs.find(r=>r.id===id)?.notes}).eq("id",id);
    setCompletingId(null);setCompleteForm({time:"",notes:""});loadRuns();
  }
  async function saveMetric(){
    await supabase.from("metrics").insert({...newMetric,user_id:user.id,weight:parseFloat(newMetric.weight),rhr:parseInt(newMetric.rhr),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})});
    setNewMetric({weight:"",rhr:"",notes:""});setShowAddMetric(false);loadMetrics();
  }
  async function saveRecovery(){
    const readiness=getReadiness(newRecovery.sleep,newRecovery.soreness,newRecovery.energy);
    await supabase.from("recovery").insert({...newRecovery,readiness,user_id:user.id,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})});
    setNewRecovery({sleep:7,soreness:3,energy:7,notes:""});setShowAddRecovery(false);loadRecovery();
  }
  async function saveProfile(){await supabase.from("profiles").update(editProfile).eq("id",user.id);setProfile({...profile,...editProfile});setShowEditProfile(false);}
  async function signOut(){await supabase.auth.signOut();}

  if(loading)return<div style={{fontFamily:"Georgia, serif",background:"#080c14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#f0ece4"}}><div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:16}}>🏃</div><div style={{fontSize:14,opacity:0.5}}>Loading...</div></div></div>;
  if(!user||!profile)return<AuthScreen onAuth={u=>{setUser(u);loadProfile(u.id);}}/>;

  const color=profile.color||"#FF6B35";
  const today=new Date().toISOString().split("T")[0];
  const upcomingRuns=runs.filter(r=>!r.completed).sort((a,b)=>a.date.localeCompare(b.date));
  const completedRuns=runs.filter(r=>r.completed).sort((a,b)=>b.date.localeCompare(a.date));
  const totalMiles=completedRuns.reduce((s,r)=>s+(r.miles||0),0);
  const latestRecovery=recovery[0];
  const latestMetric=metrics[metrics.length-1];
  const prevMetric=metrics[metrics.length-2];

  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-weekStart.getDay());weekStart.setHours(0,0,0,0);
  const weekMiles=completedRuns.filter(r=>new Date(r.date+"T00:00:00")>=weekStart).reduce((s,r)=>s+(r.miles||0),0);
  const soon=new Date();soon.setDate(soon.getDate()+3);
  const upcomingLongRun=upcomingRuns.find(r=>r.type==="Long Run"&&new Date(r.date+"T00:00:00")<=soon)?.miles||null;
  const todayRunType=upcomingRuns.find(r=>r.date===today)?.type||completedRuns.find(r=>r.date===today)?.type||null;
  const hasActivePlan=upcomingRuns.some(r=>r.notes&&r.notes.includes("["));

  // ── Week interval logic for training tab
  // Group upcoming runs by plan_week, show current week + next week
  const planWeeks=[...new Set(upcomingRuns.map(r=>r.plan_week).filter(Boolean))].sort((a,b)=>a-b);
  const currentPlanWeek=planWeeks[0]||null;
  const nextPlanWeek=planWeeks[1]||null;

  // Runs in current week (by plan_week if set, else by calendar week)
  const currentWeekRuns=currentPlanWeek
    ? upcomingRuns.filter(r=>r.plan_week===currentPlanWeek)
    : upcomingRuns.filter(r=>{const d=new Date(r.date+"T00:00:00");return d>=weekStart&&d<new Date(weekStart.getTime()+7*86400000);});
  const nextWeekRuns=nextPlanWeek
    ? upcomingRuns.filter(r=>r.plan_week===nextPlanWeek)
    : upcomingRuns.filter(r=>{const nextWkStart=new Date(weekStart.getTime()+7*86400000);const nextWkEnd=new Date(weekStart.getTime()+14*86400000);const d=new Date(r.date+"T00:00:00");return d>=nextWkStart&&d<nextWkEnd;});
  const otherUpcoming=upcomingRuns.filter(r=>!currentWeekRuns.includes(r)&&!nextWeekRuns.includes(r));

  const inp={width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"9px 12px",color:"#f0ece4",fontSize:14,boxSizing:"border-box",fontFamily:"Georgia, serif"};

  const tabs=[
    {id:"dashboard",   label:"Home",        emoji:"🏠"},
    {id:"training",    label:"Training",    emoji:"📅"},
    {id:"recovery",    label:"Recovery",    emoji:"🛌"},
    {id:"metrics",     label:"Metrics",     emoji:"📈"},
    {id:"nutrition",   label:"Nutrition",   emoji:"🥗"},
    {id:"plans",       label:"Plans",       emoji:"📋"},
    {id:"leaderboard", label:"Leaderboard", emoji:"🏆"},
    {id:"profile",     label:"Profile",     emoji:"👤"},
  ];

  function RunCard({run}) {
    const isToday=run.date===today;
    const isCompleting=completingId===run.id;
    return(
      <div style={{background:isToday?`${color}14`:"rgba(255,255,255,0.04)",border:`1px solid ${isToday?color+"40":"rgba(255,255,255,0.07)"}`,borderLeft:`3px solid ${typeColor[run.type]||color}`,borderRadius:14,padding:14,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{fontWeight:"bold",fontSize:14}}>{run.type}</div>
              {isToday&&<div style={{background:`${color}25`,color,borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:"bold"}}>TODAY</div>}
            </div>
            <div style={{fontSize:11,opacity:0.42,marginTop:2}}>{run.date}</div>
            {run.notes&&<div style={{fontSize:11,opacity:0.48,marginTop:4,lineHeight:1.4}}>{run.notes.replace(/\[.*?\]\s*/g,"")}</div>}
          </div>
          <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
            <div style={{color:typeColor[run.type]||color,fontWeight:"bold",fontSize:17}}>{run.miles} mi</div>
            <div style={{display:"flex",gap:5}}>
              <button onClick={()=>{setCompletingId(isCompleting?null:run.id);setCompleteForm({time:"",notes:""}); }} style={{fontSize:11,background:isCompleting?"rgba(168,230,207,0.2)":"rgba(168,230,207,0.1)",border:`1px solid rgba(168,230,207,${isCompleting?"0.5":"0.2"})`,borderRadius:7,padding:"4px 8px",color:"#A8E6CF",cursor:"pointer"}}>✓ Done</button>
              <button onClick={()=>deleteRun(run.id)} style={{fontSize:11,background:"rgba(255,100,100,0.1)",border:"none",borderRadius:7,padding:"4px 7px",color:"#FF6B6B",cursor:"pointer"}}>✕</button>
            </div>
          </div>
        </div>
        {isCompleting&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:12,color:"#A8E6CF",fontWeight:"bold",marginBottom:8}}>🎉 Nice work! Log your details:</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{flex:1}}><div style={{fontSize:10,opacity:0.5,marginBottom:3}}>TIME</div><input placeholder="e.g. 32:15" value={completeForm.time} onChange={e=>setCompleteForm({...completeForm,time:e.target.value})} style={{...inp,fontSize:13,padding:"7px 10px"}}/></div>
              <div style={{flex:2}}><div style={{fontSize:10,opacity:0.5,marginBottom:3}}>NOTES</div><input placeholder="How did it go?" value={completeForm.notes} onChange={e=>setCompleteForm({...completeForm,notes:e.target.value})} style={{...inp,fontSize:13,padding:"7px 10px"}}/></div>
            </div>
            <button onClick={()=>markComplete(run.id)} style={{width:"100%",background:"#A8E6CF",border:"none",borderRadius:9,padding:"9px",color:"#000",fontWeight:"bold",cursor:"pointer",fontSize:13}}>Mark Complete ✓</button>
          </div>
        )}
      </div>
    );
  }

  return(
    <div style={{fontFamily:"'Georgia',serif",background:"linear-gradient(160deg,#080c14 0%,#111827 50%,#0c0a18 100%)",minHeight:"100vh",color:"#f0ece4",maxWidth:480,margin:"0 auto"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:`radial-gradient(ellipse at 15% 15%,${color}11 0%,transparent 55%)`}}/>

      {/* Header */}
      <div style={{padding:"20px 18px 13px",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(8,12,20,0.85)",backdropFilter:"blur(14px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:5,color,textTransform:"uppercase",marginBottom:3}}>Family</div>
            <div style={{fontSize:24,fontWeight:"bold"}}>Run Together</div>
          </div>
          <div style={{background:`${color}18`,border:`1px solid ${color}33`,borderRadius:12,padding:"7px 13px",fontSize:13}}>{profile.avatar} {profile.name}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"sticky",top:78,zIndex:9,overflowX:"auto",background:"rgba(8,12,20,0.75)",backdropFilter:"blur(8px)"}}>
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{flexShrink:0,minWidth:62,padding:"9px 3px",border:"none",background:"transparent",cursor:"pointer",color:activeTab===tab.id?color:"rgba(240,236,228,0.42)",borderBottom:`2px solid ${activeTab===tab.id?color:"transparent"}`,fontSize:9,transition:"all 0.2s"}}>
            <div style={{fontSize:15}}>{tab.emoji}</div>
            <div style={{marginTop:2}}>{tab.label}</div>
          </button>
        ))}
      </div>

      <div style={{padding:"20px 18px 70px",position:"relative",zIndex:1}}>

        {/* DASHBOARD */}
        {activeTab==="dashboard"&&(
          <div>
            <WeatherWidget/>
            <div style={{background:`linear-gradient(135deg,${color}1e,${color}08)`,border:`1px solid ${color}30`,borderRadius:20,padding:18,marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:40}}>{profile.avatar}</div>
                  <div style={{fontSize:22,fontWeight:"bold",marginTop:6}}>{profile.name}</div>
                  <div style={{fontSize:13,color,marginTop:2}}>🎯 {profile.goal||"Set a goal in Profile!"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{background:`${color}25`,borderRadius:12,padding:"5px 11px",marginBottom:7,fontSize:13}}>🏃 {totalMiles.toFixed(1)} total mi</div>
                  <div style={{background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"5px 11px",fontSize:13}}>📊 {completedRuns.length} runs</div>
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
              {[
                {label:"Miles this week",value:weekMiles.toFixed(1),emoji:"🗺️"},
                {label:"Runs logged",value:completedRuns.length,emoji:"📊"},
                {label:"Latest weight",value:latestMetric?`${latestMetric.weight} lbs`:"—",emoji:"⚖️"},
                {label:"Readiness",value:latestRecovery?latestRecovery.readiness:"—",emoji:"🛌"},
              ].map((s,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:13}}>
                  <div style={{fontSize:20}}>{s.emoji}</div>
                  <div style={{fontSize:18,fontWeight:"bold",marginTop:5}}>{s.value}</div>
                  <div style={{fontSize:11,opacity:0.5,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            {upcomingRuns[0]&&(
              <div style={{background:`${color}12`,border:`1px solid ${color}30`,borderRadius:16,padding:15,marginBottom:18}}>
                <div style={{fontSize:10,letterSpacing:3,color,textTransform:"uppercase",marginBottom:8}}>Next Up</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:"bold",fontSize:16}}>{upcomingRuns[0].type}</div>
                    <div style={{fontSize:12,opacity:0.55,marginTop:3}}>{upcomingRuns[0].date===today?"Today":upcomingRuns[0].date}</div>
                    {upcomingRuns[0].notes&&<div style={{fontSize:11,opacity:0.5,marginTop:4,fontStyle:"italic"}}>{upcomingRuns[0].notes.replace(/\[.*?\]\s*/g,"")}</div>}
                  </div>
                  <div style={{color,fontWeight:"bold",fontSize:20}}>{upcomingRuns[0].miles} mi</div>
                </div>
              </div>
            )}
            {latestRecovery&&(
              <div style={{background:`${readinessColor[latestRecovery.readiness]}10`,border:`1px solid ${readinessColor[latestRecovery.readiness]}30`,borderRadius:16,padding:15,marginBottom:18,textAlign:"center"}}>
                <div style={{fontSize:10,letterSpacing:3,opacity:0.55,textTransform:"uppercase",marginBottom:6}}>Today's Readiness</div>
                <div style={{fontSize:24,fontWeight:"bold",color:readinessColor[latestRecovery.readiness]}}>{readinessIcon[latestRecovery.readiness]} {latestRecovery.readiness}</div>
              </div>
            )}
            <div style={{background:"linear-gradient(135deg,rgba(78,205,196,0.12),rgba(78,205,196,0.04))",border:"1px solid rgba(78,205,196,0.22)",borderRadius:16,padding:15}}>
              <div style={{fontSize:10,letterSpacing:3,color:"#4ECDC4",textTransform:"uppercase",marginBottom:8}}>Coach's Tip</div>
              <div style={{fontSize:13,lineHeight:1.7,opacity:0.88}}>"Consistency beats intensity every time. A 30-minute easy run today is worth more than skipping because you can't do a hard workout. Just get out there!"</div>
            </div>
          </div>
        )}

        {/* TRAINING */}
        {activeTab==="training"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div><div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase"}}>Training</div><div style={{fontSize:20,fontWeight:"bold"}}>Your Schedule</div></div>
              <button onClick={()=>setShowLogRun(!showLogRun)} style={{background:color,border:"none",borderRadius:12,padding:"9px 15px",color:"#000",fontWeight:"bold",cursor:"pointer",fontSize:13}}>+ Add Run</button>
            </div>

            {showLogRun&&(
              <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${color}44`,borderRadius:16,padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:"bold",marginBottom:14}}>Add a Run 🏃</div>
                {[
                  {label:"DATE",el:<input type="date" value={newRun.date} onChange={e=>setNewRun({...newRun,date:e.target.value})} style={inp}/>},
                  {label:"RUN TYPE",el:<select value={newRun.type} onChange={e=>setNewRun({...newRun,type:e.target.value})} style={inp}>{RUN_TYPES.map(t=><option key={t}>{t}</option>)}</select>},
                  {label:"DISTANCE (miles)",el:<input type="number" placeholder="e.g. 3.1" value={newRun.miles} onChange={e=>setNewRun({...newRun,miles:e.target.value})} style={inp}/>},
                  {label:"TIME (optional)",el:<input placeholder="e.g. 28:45" value={newRun.time} onChange={e=>setNewRun({...newRun,time:e.target.value})} style={inp}/>},
                  {label:"NOTES",el:<input placeholder="Any notes..." value={newRun.notes} onChange={e=>setNewRun({...newRun,notes:e.target.value})} style={inp}/>},
                ].map((f,i)=><div key={i} style={{marginBottom:10}}><div style={{fontSize:11,opacity:0.55,marginBottom:4}}>{f.label}</div>{f.el}</div>)}
                <div style={{display:"flex",gap:10,marginTop:14}}>
                  <button onClick={()=>setShowLogRun(false)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"none",borderRadius:10,padding:11,color:"#f0ece4",cursor:"pointer"}}>Cancel</button>
                  <button onClick={saveRun} style={{flex:2,background:color,border:"none",borderRadius:10,padding:11,color:"#000",fontWeight:"bold",cursor:"pointer"}}>Save ✓</button>
                </div>
              </div>
            )}

            {/* Current week */}
            {currentWeekRuns.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase"}}>
                    {currentPlanWeek?`Plan Week ${currentPlanWeek}`:"This Week"}
                  </div>
                  <div style={{fontSize:12,opacity:0.4}}>{currentWeekRuns.length} run{currentWeekRuns.length!==1?"s":""} · {currentWeekRuns.reduce((s,r)=>s+(r.miles||0),0).toFixed(1)} mi</div>
                </div>
                {currentWeekRuns.map(run=><RunCard key={run.id} run={run}/>)}
              </div>
            )}

            {/* No upcoming runs */}
            {upcomingRuns.length===0&&(
              <div style={{textAlign:"center",padding:32,opacity:0.4,border:"1px dashed rgba(255,255,255,0.12)",borderRadius:14,marginBottom:20}}>
                All caught up! 🎉 Add a run or start a plan.
              </div>
            )}

            {/* Next week preview */}
            {nextWeekRuns.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:11,letterSpacing:3,opacity:0.4,textTransform:"uppercase"}}>
                    {nextPlanWeek?`Up Next — Week ${nextPlanWeek}`:"Next Week"}
                  </div>
                  <div style={{fontSize:12,opacity:0.35}}>{nextWeekRuns.reduce((s,r)=>s+(r.miles||0),0).toFixed(1)} mi</div>
                </div>
                {nextWeekRuns.map(run=>(
                  <div key={run.id} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderLeft:`3px solid ${typeColor[run.type]||color}55`,borderRadius:14,padding:13,marginBottom:9,opacity:0.65}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div>
                        <div style={{fontWeight:"bold",fontSize:13}}>{run.type}</div>
                        <div style={{fontSize:11,opacity:0.4,marginTop:2}}>{run.date}</div>
                      </div>
                      <div style={{color:typeColor[run.type]||color,fontWeight:"bold",opacity:0.7}}>{run.miles} mi</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed runs collapsible */}
            {completedRuns.length>0&&(
              <div>
                <button onClick={()=>setShowCompletedRuns(!showCompletedRuns)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 16px",cursor:"pointer",color:"#f0ece4",marginBottom:showCompletedRuns?10:0}}>
                  <div style={{fontSize:13,fontWeight:"bold"}}>✅ Completed Runs ({completedRuns.length})</div>
                  <div style={{opacity:0.4}}>{showCompletedRuns?"▲":"▼"}</div>
                </button>
                {showCompletedRuns&&completedRuns.map(run=>(
                  <div key={run.id} style={{background:"rgba(168,230,207,0.04)",border:"1px solid rgba(168,230,207,0.1)",borderLeft:"3px solid rgba(168,230,207,0.35)",borderRadius:13,padding:13,marginBottom:9,opacity:0.75}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:13,fontWeight:"bold"}}>{run.type}</span>
                          <span style={{fontSize:10,color:"#A8E6CF"}}>✓ Done</span>
                        </div>
                        <div style={{fontSize:11,opacity:0.38,marginTop:2}}>{run.date}</div>
                        {run.notes&&<div style={{fontSize:11,opacity:0.45,marginTop:3,fontStyle:"italic"}}>{run.notes.replace(/\[.*?\]\s*/g,"")}</div>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:15,fontWeight:"bold",color:"#A8E6CF"}}>{run.miles} mi</div>
                        {run.time&&<div style={{fontSize:11,opacity:0.4,marginTop:2}}>⏱ {run.time}</div>}
                        <button onClick={()=>deleteRun(run.id)} style={{marginTop:5,fontSize:10,background:"rgba(255,100,100,0.1)",border:"none",borderRadius:6,padding:"3px 7px",color:"#FF6B6B",cursor:"pointer"}}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECOVERY */}
        {activeTab==="recovery"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase"}}>Recovery</div><div style={{fontSize:20,fontWeight:"bold"}}>Your Readiness</div></div>
              <button onClick={()=>setShowAddRecovery(!showAddRecovery)} style={{background:color,border:"none",borderRadius:12,padding:"9px 15px",color:"#000",fontWeight:"bold",cursor:"pointer",fontSize:13}}>+ Check In</button>
            </div>
            {latestRecovery&&!showAddRecovery&&(
              <div style={{background:`${readinessColor[latestRecovery.readiness]}12`,border:`1px solid ${readinessColor[latestRecovery.readiness]}35`,borderRadius:20,padding:20,marginBottom:20,textAlign:"center"}}>
                <div style={{fontSize:10,letterSpacing:3,opacity:0.55,textTransform:"uppercase",marginBottom:8}}>Today's Readiness</div>
                <div style={{fontSize:28,fontWeight:"bold",color:readinessColor[latestRecovery.readiness],marginBottom:4}}>{readinessIcon[latestRecovery.readiness]} {latestRecovery.readiness}</div>
                <div style={{display:"flex",justifyContent:"center",gap:18,marginTop:14,fontSize:13}}>
                  <span>😴 {latestRecovery.sleep}h</span><span>💢 {latestRecovery.soreness}/10</span><span>⚡ {latestRecovery.energy}/10</span>
                </div>
              </div>
            )}
            {showAddRecovery&&(
              <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${color}44`,borderRadius:16,padding:18,marginBottom:20}}>
                <div style={{fontSize:15,fontWeight:"bold",marginBottom:16}}>🛌 Morning Check-In</div>
                {[
                  {label:"Sleep (hours)",key:"sleep",min:1,max:12,c:"#7EC8E3",emoji:"😴",suffix:"h"},
                  {label:"Soreness (0=none, 10=very sore)",key:"soreness",min:0,max:10,c:"#FF6B35",emoji:"💢",suffix:"/10"},
                  {label:"Energy Level",key:"energy",min:0,max:10,c:"#FFE66D",emoji:"⚡",suffix:"/10"},
                ].map(f=>(
                  <div key={f.key} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                      <span>{f.emoji} {f.label}</span>
                      <span style={{color:f.c,fontWeight:"bold"}}>{newRecovery[f.key]}{f.suffix}</span>
                    </div>
                    <input type="range" min={f.min} max={f.max} value={newRecovery[f.key]} onChange={e=>setNewRecovery({...newRecovery,[f.key]:Number(e.target.value)})} style={{width:"100%",accentColor:f.c}}/>
                  </div>
                ))}
                <div style={{background:`${readinessColor[getReadiness(newRecovery.sleep,newRecovery.soreness,newRecovery.energy)]}12`,border:`1px solid ${readinessColor[getReadiness(newRecovery.sleep,newRecovery.soreness,newRecovery.energy)]}35`,borderRadius:12,padding:12,marginBottom:14,textAlign:"center"}}>
                  <div style={{fontSize:10,opacity:0.55,marginBottom:4}}>YOUR READINESS</div>
                  <div style={{fontSize:20,fontWeight:"bold",color:readinessColor[getReadiness(newRecovery.sleep,newRecovery.soreness,newRecovery.energy)]}}>
                    {readinessIcon[getReadiness(newRecovery.sleep,newRecovery.soreness,newRecovery.energy)]} {getReadiness(newRecovery.sleep,newRecovery.soreness,newRecovery.energy)}
                  </div>
                </div>
                <div style={{marginBottom:14}}><div style={{fontSize:11,opacity:0.55,marginBottom:4}}>NOTES</div><input value={newRecovery.notes} onChange={e=>setNewRecovery({...newRecovery,notes:e.target.value})} placeholder="How do you feel?" style={inp}/></div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setShowAddRecovery(false)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"none",borderRadius:10,padding:11,color:"#f0ece4",cursor:"pointer"}}>Cancel</button>
                  <button onClick={saveRecovery} style={{flex:2,background:color,border:"none",borderRadius:10,padding:11,color:"#000",fontWeight:"bold",cursor:"pointer"}}>Save ✓</button>
                </div>
              </div>
            )}
            <div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase",marginBottom:12}}>History</div>
            {recovery.length===0?<div style={{textAlign:"center",padding:30,opacity:0.45,border:"1px dashed rgba(255,255,255,0.12)",borderRadius:16}}>No check-ins yet!</div>
              :recovery.map((e,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderLeft:`3px solid ${readinessColor[e.readiness]}`,borderRadius:14,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div style={{fontSize:13,fontWeight:"bold"}}>{e.date}</div>
                    <div style={{fontSize:11,padding:"3px 9px",borderRadius:8,fontWeight:"bold",background:`${readinessColor[e.readiness]}18`,color:readinessColor[e.readiness]}}>{e.readiness}</div>
                  </div>
                  <div style={{display:"flex",gap:16,marginTop:7,fontSize:12,opacity:0.65}}>
                    <span>😴 {e.sleep}h</span><span>💢 {e.soreness}/10</span><span>⚡ {e.energy}/10</span>
                  </div>
                  {e.notes&&<div style={{fontSize:12,opacity:0.5,marginTop:5,fontStyle:"italic"}}>"{e.notes}"</div>}
                </div>
              ))
            }
          </div>
        )}

        {/* METRICS */}
        {activeTab==="metrics"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase"}}>Body Metrics</div><div style={{fontSize:20,fontWeight:"bold"}}>Your Trends</div></div>
              <button onClick={()=>setShowAddMetric(!showAddMetric)} style={{background:color,border:"none",borderRadius:12,padding:"9px 15px",color:"#000",fontWeight:"bold",cursor:"pointer",fontSize:13}}>+ Log</button>
            </div>
            {showAddMetric&&(
              <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${color}44`,borderRadius:16,padding:16,marginBottom:20}}>
                <div style={{fontSize:15,fontWeight:"bold",marginBottom:14}}>Log Metrics</div>
                {[{label:"Weight (lbs)",key:"weight",placeholder:"e.g. 178"},{label:"Resting Heart Rate (bpm)",key:"rhr",placeholder:"e.g. 52"},{label:"Notes",key:"notes",placeholder:"How are you feeling?"}].map(f=>(
                  <div key={f.key} style={{marginBottom:10}}><div style={{fontSize:11,opacity:0.55,marginBottom:4}}>{f.label}</div><input placeholder={f.placeholder} value={newMetric[f.key]} onChange={e=>setNewMetric({...newMetric,[f.key]:e.target.value})} style={inp}/></div>
                ))}
                <div style={{display:"flex",gap:10,marginTop:12}}>
                  <button onClick={()=>setShowAddMetric(false)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"none",borderRadius:10,padding:11,color:"#f0ece4",cursor:"pointer"}}>Cancel</button>
                  <button onClick={saveMetric} style={{flex:2,background:color,border:"none",borderRadius:10,padding:11,color:"#000",fontWeight:"bold",cursor:"pointer"}}>Save ✓</button>
                </div>
              </div>
            )}
            {latestMetric&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                {[
                  {label:"Current Weight",value:`${latestMetric.weight} lbs`,delta:prevMetric?(latestMetric.weight-prevMetric.weight).toFixed(1):null,unit:"lbs",emoji:"⚖️"},
                  {label:"Resting HR",value:`${latestMetric.rhr} bpm`,delta:prevMetric?(latestMetric.rhr-prevMetric.rhr):null,unit:"bpm",emoji:"❤️"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${color}28`,borderRadius:14,padding:14}}>
                    <div style={{fontSize:22}}>{s.emoji}</div>
                    <div style={{fontSize:22,fontWeight:"bold",marginTop:6}}>{s.value}</div>
                    <div style={{fontSize:11,opacity:0.55,marginTop:2}}>{s.label}</div>
                    {s.delta!==null&&<div style={{fontSize:11,marginTop:6,color:Number(s.delta)<0?"#A8E6CF":"#FF6B35",fontWeight:"bold"}}>{Number(s.delta)>0?"▲":"▼"} {Math.abs(s.delta)} {s.unit}</div>}
                  </div>
                ))}
              </div>
            )}
            {metrics.length>1&&(
              <>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {[{key:"weight",label:"Weight"},{key:"rhr",label:"Heart Rate"}].map(t=>(
                    <button key={t.key} onClick={()=>setMetricView(t.key)} style={{padding:"7px 14px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,background:metricView===t.key?color:"rgba(255,255,255,0.07)",color:metricView===t.key?"#000":"#f0ece4",fontWeight:metricView===t.key?"bold":"normal"}}>{t.label}</button>
                  ))}
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:16,marginBottom:20}}>
                  <svg viewBox="0 0 300 120" style={{width:"100%",overflow:"visible"}}>
                    <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
                    {(()=>{
                      const vals=metrics.map(d=>metricView==="weight"?d.weight:d.rhr);
                      const min=Math.min(...vals)-2,max=Math.max(...vals)+2;
                      const pts=metrics.map((d,i)=>({x:(i/(metrics.length-1))*260+20,y:10+80-((vals[i]-min)/(max-min))*80,val:vals[i],date:d.date}));
                      const poly=pts.map(p=>`${p.x},${p.y}`).join(" ");
                      return(<>
                        {[20,55,90].map(y=><line key={y} x1="10" y1={y} x2="290" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
                        <polygon points={`${pts[0].x},110 ${poly} ${pts[pts.length-1].x},110`} fill="url(#mg)"/>
                        <polyline points={poly} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                        {pts.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="4" fill={color}/><text x={p.x} y={p.y-10} textAnchor="middle" fill="#f0ece4" fontSize="9" fontWeight="bold">{p.val}</text><text x={p.x} y={115} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">{(p.date||"").split(" ")[1]||""}</text></g>)}
                      </>);
                    })()}
                  </svg>
                </div>
              </>
            )}
            <div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase",marginBottom:12}}>History</div>
            {metrics.length===0?<div style={{textAlign:"center",padding:30,opacity:0.45,border:"1px dashed rgba(255,255,255,0.12)",borderRadius:16}}>No metrics yet!</div>
              :[...metrics].reverse().map((m,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderLeft:`3px solid ${color}`,borderRadius:14,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div style={{fontSize:13,fontWeight:"bold"}}>{m.date}</div>
                    <div style={{display:"flex",gap:14}}><span style={{fontSize:13}}>⚖️ {m.weight} lbs</span><span style={{fontSize:13}}>❤️ {m.rhr} bpm</span></div>
                  </div>
                  {m.notes&&<div style={{fontSize:12,opacity:0.55,marginTop:6,fontStyle:"italic"}}>"{m.notes}"</div>}
                </div>
              ))
            }
          </div>
        )}

        {/* NUTRITION */}
        {activeTab==="nutrition"&&(
          <NutritionTab
            color={color}
            latestMetric={latestMetric}
            prevMetric={prevMetric}
            latestRecovery={latestRecovery}
            weeklyMiles={weekMiles}
            upcomingLongRun={upcomingLongRun}
            todayRunType={todayRunType}
            upcomingRuns={upcomingRuns}
          />
        )}

        {/* PLANS */}
        {activeTab==="plans"&&(
          <PlansTab color={color} userId={user.id} onPlanActivated={loadRuns} hasActivePlan={hasActivePlan}/>
        )}

        {/* LEADERBOARD */}
        {activeTab==="leaderboard"&&(
          <LeaderboardTab color={color} currentUserId={user.id}/>
        )}

        {/* PROFILE */}
        {activeTab==="profile"&&(
          <div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,letterSpacing:3,opacity:0.5,textTransform:"uppercase"}}>Account</div>
              <div style={{fontSize:20,fontWeight:"bold"}}>Your Profile</div>
            </div>
            {!showEditProfile?(
              <div style={{background:`linear-gradient(135deg,${color}1e,${color}08)`,border:`1px solid ${color}30`,borderRadius:20,padding:20,marginBottom:20,textAlign:"center"}}>
                <div style={{fontSize:60,marginBottom:10}}>{profile.avatar}</div>
                <div style={{fontSize:24,fontWeight:"bold"}}>{profile.name}</div>
                <div style={{fontSize:13,color,marginTop:6}}>🎯 {profile.goal||"No goal set yet"}</div>
                <div style={{fontSize:12,opacity:0.45,marginTop:6}}>{user.email}</div>
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:12}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:color}}/>
                  <div style={{fontSize:12,opacity:0.55}}>Your color</div>
                </div>
                <button onClick={()=>{setEditProfile({name:profile.name,avatar:profile.avatar,color:profile.color,goal:profile.goal});setShowEditProfile(true);}} style={{marginTop:16,background:color,border:"none",borderRadius:12,padding:"10px 24px",color:"#000",fontWeight:"bold",cursor:"pointer",fontSize:14}}>Edit Profile</button>
              </div>
            ):(
              <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${color}44`,borderRadius:16,padding:18,marginBottom:20}}>
                <div style={{fontSize:15,fontWeight:"bold",marginBottom:16}}>Edit Profile</div>
                <div style={{marginBottom:14}}><div style={{fontSize:11,opacity:0.55,marginBottom:4}}>NAME</div><input value={editProfile.name||""} onChange={e=>setEditProfile({...editProfile,name:e.target.value})} style={inp}/></div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,opacity:0.55,marginBottom:6}}>AVATAR</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {AVATAR_OPTIONS.map(a=><button key={a} onClick={()=>setEditProfile({...editProfile,avatar:a})} style={{fontSize:24,padding:"6px 8px",borderRadius:10,border:`2px solid ${editProfile.avatar===a?color:"transparent"}`,background:editProfile.avatar===a?`${color}20`:"rgba(255,255,255,0.06)",cursor:"pointer"}}>{a}</button>)}
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,opacity:0.55,marginBottom:6}}>COLOR</div>
                  <div style={{display:"flex",gap:8}}>
                    {COLOR_OPTIONS.map(c=><button key={c} onClick={()=>setEditProfile({...editProfile,color:c})} style={{width:32,height:32,borderRadius:"50%",background:c,border:`3px solid ${editProfile.color===c?"#fff":"transparent"}`,cursor:"pointer"}}/>)}
                  </div>
                </div>
                <div style={{marginBottom:16}}><div style={{fontSize:11,opacity:0.55,marginBottom:4}}>GOAL</div><input value={editProfile.goal||""} onChange={e=>setEditProfile({...editProfile,goal:e.target.value})} placeholder="e.g. Run a Half Marathon" style={inp}/></div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setShowEditProfile(false)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"none",borderRadius:10,padding:11,color:"#f0ece4",cursor:"pointer"}}>Cancel</button>
                  <button onClick={saveProfile} style={{flex:2,background:color,border:"none",borderRadius:10,padding:11,color:"#000",fontWeight:"bold",cursor:"pointer"}}>Save Changes ✓</button>
                </div>
              </div>
            )}
            <button onClick={signOut} style={{width:"100%",background:"rgba(255,100,100,0.12)",border:"1px solid rgba(255,100,100,0.25)",borderRadius:12,padding:14,color:"#FF6B6B",fontWeight:"bold",cursor:"pointer",fontSize:14,fontFamily:"Georgia, serif"}}>Sign Out</button>
          </div>
        )}

      </div>
    </div>
  );
}