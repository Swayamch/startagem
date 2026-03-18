import { useState, useEffect, useRef, Fragment } from 'react'
import Dither from './Dither'
import TextCursor from './TextCursor'
import TargetCursor from './TargetCursor'
import GradualBlur from './GradualBlur'

/* ───────── inject global styles + Google Fonts ───────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body {
  background:#0d0010;
  color:#e9d5ff;
  font-family:'Syne',sans-serif;
  overflow-x:hidden;
}

/* ── scrollbar ── */
::-webkit-scrollbar { width:8px; }
::-webkit-scrollbar-track { background:#0d0010; }
::-webkit-scrollbar-thumb { background:#9333ea; border:2px solid #00000022; }

/* ── neo-brutal card ── */
.nb-card {
  background:#1a0a2e;
  border:3px solid #e9d5ff;
  box-shadow:6px 6px 0px #9333ea;
  padding:2rem 1.8rem;
  text-align:center;
  transition:transform .2s, box-shadow .2s;
  position:relative;
}
.nb-card:hover {
  transform:translate(-3px,-3px);
  box-shadow:9px 9px 0px #7c3aed;
}

/* ── CTA button neo-brutal ── */
.nb-btn {
  display:inline-block;
  margin-top:2rem;
  padding:1rem 2.8rem;
  font-family:'Syne',sans-serif;
  font-size:1.15rem;
  font-weight:800;
  color:#0d0010;
  background:#9333ea;
  border:3px solid #e9d5ff;
  box-shadow:5px 5px 0px #e9d5ff;
  cursor:pointer;
  text-decoration:none;
  text-transform:uppercase;
  letter-spacing:.08em;
  transition:transform .15s, box-shadow .15s;
}
.nb-btn:hover {
  transform:translate(-2px,-2px);
  box-shadow:7px 7px 0px #e9d5ff;
}
.nb-btn:active {
  transform:translate(2px,2px);
  box-shadow:2px 2px 0px #e9d5ff;
}

/* ── stat cards ── */
.stat-val {
  font-size:2.8rem;
  font-weight:800;
  color:#9333ea;
  line-height:1;
}
.stat-label {
  margin-top:.6rem;
  font-family:'JetBrains Mono',monospace;
  font-size:.8rem;
  color:rgba(233,213,255,.6);
  text-transform:uppercase;
  letter-spacing:.15em;
}

/* ── timeline ── */
.tl-line {
  position:absolute;
  left:50%;
  top:0;
  width:8px;
  height:0;
  background:#9333ea;
  border:2px solid #e9d5ff;
  transform:translateX(-50%);
  transition:height 1.5s cubic-bezier(.22,1,.36,1);
}
.tl-line.active { height:100%; }

.tl-item {
  display:flex;
  align-items:center;
  gap:2rem;
  opacity:0;
  transform:translateY(25px);
  transition:opacity .6s ease, transform .6s ease;
}
.tl-item.visible { opacity:1; transform:translateY(0); }

.tl-dot {
  width:32px;height:32px;
  background:#e9d5ff;
  border:4px solid #9333ea;
  box-shadow:4px 4px 0px #0d0010;
  flex-shrink:0;
  position:relative;
  z-index:2;
  transition:transform 0.3s;
}
.tl-item:hover .tl-dot {
  transform:scale(1.15) rotate(10deg);
}

/* ── countdown cards ── */
.cd-card {
  background:#1a0a2e;
  border:3px solid #e9d5ff;
  box-shadow:5px 5px 0px #9333ea;
  padding:1.4rem 1.2rem;
  min-width:105px;
  text-align:center;
  transition:transform .2s, box-shadow .2s;
}
.cd-card:hover {
  transform:translate(-2px,-2px);
  box-shadow:7px 7px 0px #7c3aed;
}
.cd-val {
  font-size:3rem;
  font-weight:800;
  font-family:'JetBrains Mono',monospace;
  color:#e9d5ff;
}
.cd-label {
  font-size:.7rem;
  font-family:'JetBrains Mono',monospace;
  text-transform:uppercase;
  letter-spacing:.2em;
  color:rgba(233,213,255,.5);
  margin-top:.35rem;
}

/* ── step cards ── */
.step-card {
  background:#1a0a2e;
  border:3px solid #e9d5ff;
  box-shadow:6px 6px 0px #9333ea;
  padding:2.5rem 1.8rem;
  flex:1;
  min-width:240px;
  text-align:center;
  opacity:0;
  transform:translateY(30px);
  transition:opacity .6s ease, transform .6s ease, transform .2s, box-shadow .2s;
}
.step-card.visible { opacity:1; transform:translateY(0); }
.step-card:hover {
  transform:translate(-3px,-3px);
  box-shadow:9px 9px 0px #7c3aed;
}
.step-num {
  font-size:4rem;
  font-weight:800;
  color:#9333ea;
  line-height:1;
}
.step-title {
  font-size:1.25rem;
  font-weight:700;
  margin:.8rem 0 .5rem;
  color:#e9d5ff;
}
.step-desc {
  font-size:.9rem;
  color:rgba(233,213,255,.55);
  line-height:1.5;
}

/* ── arrow connector ── */
.arrow-connector {
  font-size:2.2rem;
  color:#9333ea;
  align-self:center;
  font-weight:800;
}

/* ── fade-up utility ── */
.fade-up {
  opacity:0;
  transform:translateY(30px);
  transition:opacity .7s ease, transform .7s ease;
}
.fade-up.visible { opacity:1; transform:translateY(0); }

/* ── marquee ── */
@keyframes marquee {
  0%   { transform:translateX(0); }
  100% { transform:translateX(-50%); }
}
.marquee-track {
  display:flex;
  gap:3rem;
  animation:marquee 20s linear infinite;
  white-space:nowrap;
}

/* ── hero title ── */
.hero-title {
  font-size:clamp(2.4rem,8vw,6rem);
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:.04em;
  color:#e9d5ff;
  line-height:.95;
  text-shadow:4px 4px 0px #9333ea;
  position:relative;
  z-index:2;
}

/* ── section divider ── */
.section-divider {
  width:100%;
  height:4px;
  background:#9333ea;
  border:none;
  border-top:2px solid #e9d5ff;
}

/* ── responsive ── */
@media(max-width:768px) {
  .hero-title { font-size:clamp(1.8rem,10vw,3.2rem); }
  .step-card { min-width:100%; }
  .nb-card { padding:1.5rem 1.2rem; }
  .tl-item { flex-direction:column !important; text-align:center !important; }
}
`

/* ───────────────── HERO ───────────────── */
function Hero() {
  return (
    <section id="hero" style={{
      position:'relative',
      minHeight:'100vh',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      textAlign:'center',
      overflow:'hidden',
    }}>
      {/* TextCursor layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <TextCursor
          text="GDA"
          spacing={80}
          followMouseDirection
          randomFloat
          exitDuration={0.3}
          removalInterval={20}
          maxPoints={10}
        />
      </div>

      {/* Content */}
      <div style={{ position:'relative', zIndex:2, padding:'2rem' }}>
        <div style={{
          display:'inline-block',
          background:'#9333ea',
          border:'3px solid #e9d5ff',
          padding:'.4rem 1.2rem',
          marginBottom:'1.5rem',
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:'.8rem',
          fontWeight:700,
          color:'#0d0010',
          textTransform:'uppercase',
          letterSpacing:'.15em',
          boxShadow:'3px 3px 0px #e9d5ff',
        }}>
          🎮 March 20–25, 2026
        </div>

        <h1 className="hero-title">
          GDA<br/>Game Jam<br/>2026
        </h1>

        <p style={{
          marginTop:'1.2rem',
          fontSize:'clamp(1rem,2.5vw,1.3rem)',
          color:'rgba(233,213,255,.75)',
          fontWeight:400,
          letterSpacing:'.06em',
          position:'relative',
          zIndex:2,
        }}>
          Where Developers Become Legends
        </p>

        <a href="#countdown" className="nb-btn cursor-target">Submit Your Idea →</a>
      </div>
    </section>
  )
}

/* ───────── MARQUEE DIVIDER ───────── */
function MarqueeDivider() {
  const text = 'GAME JAM 2026 ✦ BUILD ✦ COMPETE ✦ WIN ✦ '
  return (
    <div style={{
      overflow:'hidden',
      background:'#9333ea',
      borderTop:'3px solid #e9d5ff',
      borderBottom:'3px solid #e9d5ff',
      padding:'.8rem 0',
    }}>
      <div className="marquee-track">
        {[...Array(4)].map((_,i) => (
          <span key={i} style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:'1.1rem',
            fontWeight:800,
            color:'#0d0010',
            textTransform:'uppercase',
            letterSpacing:'.1em',
          }}>{text}</span>
        ))}
      </div>
    </div>
  )
}

/* ───────────────── ABOUT ───────────────── */
function About() {
  const stats = [
    { val:'48 Hrs', label:'Non-Stop Hacking' },
    { val:'1 Theme', label:'Unveiled At Start' },
    { val:'1 Winner', label:'Takes It All' },
  ]
  return (
    <section id="about" style={{
      padding:'5rem 2rem',
      maxWidth:1000,
      margin:'0 auto',
      textAlign:'center',
    }}>
      <SectionHeading>About the Jam</SectionHeading>
      <p className="fade-up" style={{
        maxWidth:640,
        margin:'1.2rem auto 3rem',
        lineHeight:1.7,
        color:'rgba(233,213,255,.65)',
        fontSize:'1.05rem',
      }}>
        GDA Game Jam is a high-intensity 48-hour battleground where developers, designers and
        dreamers collide to build playable games from scratch. One theme. One deadline.
        Infinite creativity.
      </p>
      <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', justifyContent:'center' }}>
        {stats.map((s,i)=>(
          <div key={i} className="nb-card fade-up cursor-target" style={{ flex:'1', minWidth:220, transitionDelay:`${i*.15}s` }}>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ───────────────── TIMELINE ───────────────── */
function Timeline() {
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setActive(true) },{ threshold:.3 })
    if(ref.current) obs.observe(ref.current)
    return ()=>obs.disconnect()
  },[])

  const items = [
    { phase:'PHASE 01', icon:'🚀', date:'March 1st, 2026', title:'Registration Opens', desc:'Secure your spot and form your ultimate team.' },
    { phase:'PHASE 02', icon:'📅', date:'March 20, 2026', title:'Idea Submission Deadline', desc:'Submit your game concept before midnight.' },
    { phase:'PHASE 03', icon:'🏆', date:'March 25, 2026', title:'Final Offline Round', desc:'Build & pitch your game in person to the judges.' },
  ]

  return (
    <section id="timeline" style={{ padding:'5rem 2rem', maxWidth:780, margin:'0 auto' }}>
      <SectionHeading>Timeline</SectionHeading>
      <div ref={ref} style={{ position:'relative', marginTop:'3rem' }}>
        <div className={`tl-line ${active?'active':''}`} />
        <div style={{ display:'flex', flexDirection:'column', gap:'4rem', position:'relative' }}>
          {items.map((it,i)=>(
            <div key={i} className={`tl-item ${active?'visible':''}`} style={{
              flexDirection: i%2===0?'row':'row-reverse',
              textAlign: i%2===0?'left':'right',
              transitionDelay:`${.3+i*.3}s`,
            }}>
              <div className="nb-card cursor-target" style={{ flex:1, textAlign: i%2===0?'left':'right', position:'relative' }}>
                <span style={{ fontSize:'1.8rem' }}>{it.icon}</span>
                
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  [i%2===0 ? 'right' : 'left']: '-15px',
                  background: '#9333ea',
                  color: '#e9d5ff',
                  border: '2px solid #e9d5ff',
                  boxShadow: '4px 4px 0px #0d0010',
                  padding: '4px 8px',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                }}>
                  {it.phase}
                </div>

                <div style={{
                  fontFamily:"'JetBrains Mono',monospace",
                  fontSize:'.8rem',
                  color:'#9333ea',
                  letterSpacing:'.12em',
                  marginTop:'.5rem',
                }}>{it.date}</div>
                <h3 style={{ fontSize:'1.25rem', fontWeight:700, margin:'.4rem 0 .3rem', color:'#e9d5ff' }}>{it.title}</h3>
                <p style={{ color:'rgba(233,213,255,.5)', fontSize:'.9rem' }}>{it.desc}</p>
              </div>
              <div className="tl-dot" />
              <div style={{ flex:1 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────── COUNTDOWN ───────────────── */
function Countdown() {
  const TARGET = new Date('2026-03-20T23:59:59').getTime()
  const [diff, setDiff] = useState(TARGET - Date.now())

  useEffect(()=>{
    const id = setInterval(()=> setDiff(TARGET - Date.now()), 1000)
    return ()=>clearInterval(id)
  },[])

  const d = Math.max(0, diff)
  const days    = Math.floor(d / 864e5)
  const hours   = Math.floor((d % 864e5) / 36e5)
  const minutes = Math.floor((d % 36e5) / 6e4)
  const seconds = Math.floor((d % 6e4) / 1e3)

  const units = [
    { val:days, label:'Days' },
    { val:hours, label:'Hours' },
    { val:minutes, label:'Minutes' },
    { val:seconds, label:'Seconds' },
  ]

  return (
    <section id="countdown" style={{ padding:'5rem 2rem', textAlign:'center' }}>
      <SectionHeading>Countdown to Submission</SectionHeading>
      <div style={{ display:'flex', gap:'1.2rem', justifyContent:'center', flexWrap:'wrap', marginTop:'2.5rem' }}>
        {units.map((u,i)=>(
          <div key={i} className="cd-card fade-up cursor-target" style={{ transitionDelay:`${i*.12}s` }}>
            <div className="cd-val">{String(u.val).padStart(2,'0')}</div>
            <div className="cd-label">{u.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ───────────────── HOW IT WORKS ───────────────── */
function HowItWorks() {
  const steps = [
    { num:'01', title:'Submit Idea', desc:'Pitch your game concept before the deadline closes.' },
    { num:'02', title:'Get Selected', desc:'Top ideas are shortlisted for the final offline round.' },
    { num:'03', title:'Build & Pitch', desc:'48 hours to build your game and present it to the judges.' },
  ]
  return (
    <section id="how" style={{ padding:'5rem 2rem', maxWidth:1100, margin:'0 auto' }}>
      <SectionHeading>How It Works</SectionHeading>
      <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', justifyContent:'center', marginTop:'2.5rem', alignItems:'stretch' }}>
        {steps.map((s,i)=>(
          <Fragment key={i}>
            <div className="step-card cursor-target" style={{ transitionDelay:`${i*.2}s` }}>
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
            {i < steps.length - 1 && <span className="arrow-connector">→</span>}
          </Fragment>
        ))}
      </div>
    </section>
  )
}

/* ───────────────── FOOTER ───────────────── */
function Footer() {
  return (
    <footer style={{
      padding:'2.5rem 2rem',
      textAlign:'center',
      fontFamily:"'JetBrains Mono',monospace",
      fontSize:'.78rem',
      color:'rgba(233,213,255,.4)',
      letterSpacing:'.08em',
      borderTop:'3px solid #e9d5ff',
      background:'#0d0010',
    }}>
      GDA Game Jam 2026 · All rights reserved
    </footer>
  )
}

/* ───────────── shared heading ───────────── */
function SectionHeading({ children }) {
  return (
    <h2 className="fade-up" style={{
      fontSize:'clamp(1.6rem,4vw,2.4rem)',
      fontWeight:800,
      textAlign:'center',
      marginBottom:'1rem',
      color:'#e9d5ff',
      textTransform:'uppercase',
      letterSpacing:'.04em',
      textShadow:'3px 3px 0px #9333ea',
    }}>
      {children}
    </h2>
  )
}

/* ═══════════════════ APP ═══════════════════ */
export default function App() {
  /* inject global styles once */
  useEffect(()=>{
    const tag = document.createElement('style')
    tag.textContent = STYLES
    document.head.appendChild(tag)
    return ()=> tag.remove()
  },[])

  /* intersection-observer for .fade-up elements */
  useEffect(()=>{
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible') })
    },{ threshold:.15 })

    const observe = () => {
      document.querySelectorAll('.fade-up, .step-card, .cd-card').forEach(el => obs.observe(el))
    }
    observe()
    const timer = setTimeout(observe, 300)

    return ()=>{ obs.disconnect(); clearTimeout(timer) }
  },[])

  return (
    <>
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.2}
      />

      {/* Dither WebGL Background over whole page */}
      <div style={{
        position:'fixed',
        inset:0,
        zIndex:-2,
      }}>
        <Dither
          waveColor={[0.3, 0.05, 0.5]}
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.3}
          colorNum={9.4}
          waveAmplitude={0.32}
          waveFrequency={2.6}
          waveSpeed={0.05}
        />
      </div>

      {/* Dark overlay for readability */}
      <div style={{
        position:'fixed',
        inset:0,
        background:'linear-gradient(180deg, rgba(13,0,16,.4) 0%, rgba(13,0,16,.85) 100%)',
        zIndex:-1,
        pointerEvents:'none',
      }} />

      <Hero />
      <MarqueeDivider />
      <About />
      <hr className="section-divider" />
      <Timeline />
      <hr className="section-divider" />
      <Countdown />
      <hr className="section-divider" />
      <HowItWorks />
      <Footer />

      <GradualBlur
        target="page"
        position="bottom"
        height="10rem"
        strength={2.5}
        divCount={6}
        curve="bezier"
        exponential
        opacity={1}
      />
    </>
  )
}
