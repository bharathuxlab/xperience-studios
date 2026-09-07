// Shared across every page: nav, footer, project-brief modal.
const { useEffect, useRef, useState } = React;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ARROW = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H9M17 7V15"/></svg>;

function TypeText({text}){
  const ref = useRef(null);
  const [display, setDisplay] = useState(prefersReduced ? text : '');
  const startedRef = useRef(false);
  useEffect(()=>{
    if(prefersReduced) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting && !startedRef.current){
          startedRef.current = true;
          let i = 0;
          const id = setInterval(()=>{
            i++;
            setDisplay(text.slice(0, i));
            if(i >= text.length) clearInterval(id);
          }, 26);
        }
      });
    }, {threshold:0.4});
    io.observe(el);
    return ()=>io.disconnect();
  }, [text]);
  const done = display.length >= text.length;
  return (
    <span ref={ref} className="type-text">
      {display}
      <span className={"type-caret"+(done?" done":"")}></span>
    </span>
  );
}

function useReveal(){
  useEffect(()=>{
    const els = document.querySelectorAll('.reveal');
    if(prefersReduced){ els.forEach(e=>e.classList.add('in')); return; }
    gsap.registerPlugin(ScrollTrigger);

    els.forEach((el, i)=>{
      el.classList.add('in');
      const fromScale = el.classList.contains('reveal-zoomout') ? 1.12 : 0.9;
      gsap.fromTo(el,
        {opacity:0, scale:fromScale, y:46},
        {
          opacity:1, scale:1, y:0, ease:'none',
          scrollTrigger:{trigger:el, start:'top 92%', end:'top 48%', scrub:0.7}
        }
      );
    });

    document.querySelectorAll('.parallax-slow, .parallax-fast').forEach(el=>{
      const dist = el.classList.contains('parallax-fast') ? 140 : 60;
      gsap.to(el, {
        y: -dist, ease:'none',
        scrollTrigger:{trigger: el.closest('section')||el, start:'top bottom', end:'bottom top', scrub:true}
      });
    });

    document.querySelectorAll('.zoom-shell').forEach(el=>{
      gsap.fromTo(el, {scale:1.14}, {
        scale:1, ease:'none',
        scrollTrigger:{trigger:el, start:'top bottom', end:'top 20%', scrub:0.8}
      });
    });

    return ()=>ScrollTrigger.getAll().forEach(st=>st.kill());
  },[]);
}

function Logo(){
  return (
    <a href="index.html#hero" className="logo">
      <span className="mark">
        <svg viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="xg" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0" stopColor="#e8fa9a"/>
              <stop offset="1" stopColor="#d7f23f"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="0" fill="url(#xg)"/>
          <path d="M10 10L22 22M22 10L10 22" stroke="#14201a" strokeWidth="3.4" strokeLinecap="round"/>
        </svg>
      </span>
      Xperience Studios
    </a>
  );
}

function openProjectModal(){
  window.dispatchEvent(new Event('xs-open-project'));
}

function StartProjectButton({className, children}){
  return (
    <button type="button" className={className} onClick={openProjectModal}>{children}</button>
  );
}

function Nav(){
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    document.body.style.overflow = open ? 'hidden' : '';
    return ()=>{ document.body.style.overflow = ''; };
  }, [open]);

  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  }, []);

  function go(){ setOpen(false); }
  function goAndOpenProject(){ setOpen(false); openProjectModal(); }

  return (
    <nav className="nav">
      <Logo/>
      <div className="navlinks">
        <a href="services.html">Services</a>
        <a href="index.html#work">Work</a>
        <a href="about.html">About</a>
        <a href="insights.html">Insights</a>
        <StartProjectButton className="pill">Start a project</StartProjectButton>
      </div>
      <button
        type="button"
        className={"nav-burger"+(open?" open":"")}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={()=>setOpen(o=>!o)}
      >
        <span></span><span></span><span></span>
      </button>
      <div className={"nav-mobile"+(open?" open":"")} aria-hidden={!open}>
        <a href="services.html" onClick={go}>Services</a>
        <a href="index.html#work" onClick={go}>Work</a>
        <a href="about.html" onClick={go}>About</a>
        <a href="insights.html" onClick={go}>Insights</a>
        <button type="button" className="pill" onClick={goAndOpenProject}>Start a project</button>
      </div>
    </nav>
  );
}

function Footer(){
  return (
    <footer>
      <div className="wrap foot-row">
        <span>© {new Date().getFullYear()} Xperience Studios LLC</span>
        <div className="foot-links">
          <a href="index.html#work">Work</a>
          <a href="services.html">Services</a>
          <a href="about.html">About</a>
          <a href="insights.html">Insights</a>
          <a href="mailto:bharath@xperiencestudios.com">Contact</a>
        </div>
      </div>
    </footer>
  );
}

const BUDGETS = ["Under $10K","$10K – $25K","$25K – $50K","$50K+"];
const MODAL_TIMELINES = ["ASAP","Next month","This quarter","Just exploring"];

function ProjectModal(){
  const empty = {first:'', last:'', email:'', phone:'', project:'', links:'', budget:null, timeline:null};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState(false);
  const [sentState, setSentState] = useState(null); // null | 'sent'
  const firstFieldRef = useRef(null);

  useEffect(()=>{
    function onOpen(){ setOpen(true); setSentState(null); }
    window.addEventListener('xs-open-project', onOpen);
    return ()=>window.removeEventListener('xs-open-project', onOpen);
  },[]);

  useEffect(()=>{
    if(open){
      document.body.style.overflow = 'hidden';
      setTimeout(()=>{ if(firstFieldRef.current) firstFieldRef.current.focus(); }, 60);
    } else {
      document.body.style.overflow = '';
    }
    return ()=>{ document.body.style.overflow = ''; };
  },[open]);

  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') close(); }
    if(open) window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[open]);

  function close(){ setOpen(false); }
  function set(k,v){ setForm(f=>({...f, [k]:v})); }
  function clearForm(){ setForm(empty); setTouched(false); }

  const valid = form.first.trim() && form.last.trim() && /\S+@\S+\.\S+/.test(form.email) && form.project.trim() && form.budget;

  function buildBrief(){
    return [
      `New project brief from ${form.first} ${form.last}`,
      ``,
      `Name: ${form.first} ${form.last}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : null,
      `Budget: ${form.budget}`,
      form.timeline ? `Timeline: ${form.timeline}` : null,
      ``,
      `Project:`,
      form.project,
      form.links ? `\nLinks:\n${form.links}` : null,
    ].filter(Boolean).join('\n');
  }

  function submit(e){
    e.preventDefault();
    setTouched(true);
    if(!valid) return;
    const brief = buildBrief();
    const subject = `Project brief — ${form.first} ${form.last}`;
    window.location.href = `mailto:bharath@xperiencestudios.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
    setSentState('sent');
  }

  function copyBrief(){
    navigator.clipboard && navigator.clipboard.writeText(buildBrief());
  }

  return (
    <div className={"modal-overlay"+(open?" open":"")} onMouseDown={(e)=>{ if(e.target===e.currentTarget) close(); }}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Start a project">
        <button type="button" className="modal-x" onClick={close} aria-label="Close">✕</button>

        {sentState==='sent' ? (
          <div className="modal-sent">
            <span className="kicker">Brief sent</span>
            <h3>Your email client should be open now.</h3>
            <p>If nothing happened — some browsers block it without a default mail app set — copy the brief below and send it to <b>bharath@xperiencestudios.com</b> directly.</p>
            <div className="modal-sent-actions">
              <button type="button" className="pill" onClick={copyBrief}>Copy brief</button>
              <button type="button" className="pill-outline" onClick={()=>{ clearForm(); setSentState(null); }}>Start another</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <span className="kicker">Start a project</span>
            <h3>Let's translate the brief into a plan.</h3>
            <p className="modal-sub">Fill this in — we read every one ourselves, no forms team in between.</p>

            <div className="form-section">
              <div className="form-section-head">
                <span>Personal information</span>
                <button type="button" className="form-clear" onClick={clearForm}>Clear</button>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>First name*</span>
                  <input ref={firstFieldRef} value={form.first} onChange={e=>set('first', e.target.value)} required/>
                </label>
                <label className="field">
                  <span>Last name*</span>
                  <input value={form.last} onChange={e=>set('last', e.target.value)} required/>
                </label>
                <label className="field">
                  <span>Email*</span>
                  <input type="email" value={form.email} onChange={e=>set('email', e.target.value)} required/>
                </label>
                <label className="field">
                  <span>Phone <i>(optional)</i></span>
                  <input type="tel" value={form.phone} onChange={e=>set('phone', e.target.value)}/>
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-head"><span>Project details</span></div>
              <label className="field">
                <span>Tell us what's going on*</span>
                <textarea rows="4" value={form.project} onChange={e=>set('project', e.target.value)}
                  placeholder="What you're building, what's broken, or what you're trying to figure out." required/>
              </label>
              <label className="field">
                <span>Links to share <i>(optional)</i></span>
                <input value={form.links} onChange={e=>set('links', e.target.value)} placeholder="Figma, live site, deck…"/>
              </label>

              <div className="field">
                <span>Budget*</span>
                <div className="chip-select">
                  {BUDGETS.map(b=>(
                    <button type="button" key={b} className={"demo-chip"+(form.budget===b?" active":"")} onClick={()=>set('budget', b)}>{b}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <span>Timeline <i>(optional)</i></span>
                <div className="chip-select">
                  {MODAL_TIMELINES.map(t=>(
                    <button type="button" key={t} className={"demo-chip"+(form.timeline===t?" active":"")} onClick={()=>set('timeline', t)}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            {touched && !valid && (
              <p className="form-error">First name, last name, a valid email, project details, and budget are required.</p>
            )}

            <button type="submit" className="pill modal-submit">Send project brief {ARROW}</button>
          </form>
        )}
      </div>
    </div>
  );
}
