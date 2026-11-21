import { useEffect, useRef, useState } from 'react';
import Scene from './Scene.jsx';
import { bundled, loadPortfolio, sendMessage } from './api.js';
import { img } from './images.js';

const NAV = [
  ['about', 'About'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['journey', 'Journey'],
  ['contact', 'Contact'],
];

const SOURCE_LABEL = {
  loading: 'Linking',
  api: 'Backend online',
  bundled: 'Offline data',
};

function Nav({ source }) {
  return (
    <header className="nav">
      <div className="wrap nav-row">
        <a className="brand" href="#top" aria-label="Back to top">
          <b>AT</b>
          <span>Anbuselvan</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <span className={`status ${source}`} title="Where the page data came from">
          <i aria-hidden="true" />
          {SOURCE_LABEL[source]}
        </span>
      </div>
    </header>
  );
}

function Hero({ p, education }) {
  const cgpa = (education?.[0]?.score || '').replace('CGPA ', '');
  const first = p.name.replace(/\s+T$/, '');

  return (
    <section className="hero wrap" id="top">
      <div className="hero-copy">
        <p className="eyebrow">{p.title} / 2024 to 2028</p>
        <h1 aria-label={p.name}>
          <span className="glitch" data-text={first.toUpperCase()}>
            {first.toUpperCase()}
          </span>
          <span className="initial"> T</span>
        </h1>
        <p className="lede">{p.tagline}</p>
        <div className="cta">
          <a className="btn solid" href="#projects">
            View projects
          </a>
          <a className="btn ghost" href="#contact">
            Contact me
          </a>
        </div>
        <ul className="stats">
          <li>
            <b>{cgpa}</b>
            <span>CGPA</span>
          </li>
          <li>
            <b>2</b>
            <span>Internships</span>
          </li>
          <li>
            <b>4</b>
            <span>Certificates</span>
          </li>
        </ul>
      </div>

      <figure className="frame">
        <div className="frame-img">
          <img src={img(p.photo)} alt={`Portrait of ${p.name}`} width="720" height="900" />
        </div>
        <figcaption>
          <span>{p.name}</span>
          <span>R P Sarathy Institute of Technology</span>
        </figcaption>
      </figure>
    </section>
  );
}

function Head({ kicker, title }) {
  return (
    <h2>
      <small>{kicker}</small>
      {title}
    </h2>
  );
}

function About({ p, education, soft }) {
  return (
    <section className="block wrap" id="about">
      <Head kicker="About" title="Who I am" />
      <div className="split">
        <div className="slab">
          <p className="body-lg">{p.summary}</p>
          <p className="label">Soft skills</p>
          <ul className="tags">
            {soft.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="slab">
          <p className="label">Education</p>
          <ol className="edu">
            {education.map((e) => (
              <li key={e.course}>
                <b>{e.score}</b>
                <strong>{e.school}</strong>
                <span>
                  {e.course} / {e.years}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Skills({ skills }) {
  return (
    <section className="block wrap" id="skills">
      <Head kicker="Skills" title="What I work with" />
      <ul className="chips">
        {skills.technical.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong>
            {s.level && <span>{s.level}</span>}
          </li>
        ))}
      </ul>
      <p className="label spaced">Currently learning</p>
      <ul className="tags">
        {skills.learning.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}

function Projects({ projects }) {
  return (
    <section className="block wrap" id="projects">
      <Head kicker="Projects" title="Things I built" />
      <div className="projects">
        {projects.map((pr) => (
          <article className="slab project" key={pr.title}>
            <h3>{pr.title}</h3>
            <p>{pr.summary}</p>
            <ul className="points">
              {pr.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <ul className="tags mono">
              {pr.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="links">
              {pr.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Journey({ journey, certificates }) {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <section className="block wrap" id="journey">
      <Head kicker="Journey" title="Internships and achievements" />
      <ol className="log">
        {journey.map((j) => (
          <li key={j.title}>
            <span className="when">{j.date}</span>
            <div>
              <span className="kind">{j.kind}</span>
              <strong>{j.title}</strong>
              <em>{j.org}</em>
              <p>{j.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="label spaced">Certificates</p>
      <div className="certs">
        {certificates.map((c) => {
          const src = img(c.image);
          const body = (
            <>
              {src ? (
                <img src={src} alt={`Certificate: ${c.title}`} loading="lazy" />
              ) : (
                <span className="cert-text">{c.title}</span>
              )}
              <span className="cert-cap">
                <strong>{c.title}</strong>
                <span>{[c.issuer, c.date].filter(Boolean).join(' / ')}</span>
              </span>
            </>
          );
          return src ? (
            <button type="button" className="cert" key={c.title} onClick={() => setOpen(c)}>
              {body}
            </button>
          ) : (
            <div className="cert plain" key={c.title}>
              {body}
            </div>
          );
        })}
      </div>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <img src={img(open.image)} alt={`Certificate: ${open.title}`} />
          <button type="button" className="close" onClick={() => setOpen(null)}>
            Close
          </button>
        </div>
      )}
    </section>
  );
}

function Contact({ p }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState({ s: 'idle', m: '' });
  const [copied, setCopied] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ s: 'sending', m: '' });
    try {
      await sendMessage(form);
      setState({ s: 'ok', m: 'Message sent. I will reply to your email.' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setState({
        s: 'err',
        m: err.offline
          ? `The backend is not connected here, so the message was not sent. Email me at ${p.email}.`
          : err.message,
      });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(p.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* the address is shown as text, so it can still be selected by hand */
    }
  }

  return (
    <section className="block wrap" id="contact">
      <Head kicker="Contact" title="Let us talk" />
      <div className="split">
        <div className="slab">
          <p className="body-lg">I am open to internships and campus placement opportunities. Send a message or reach me here.</p>
          <ul className="contact-list">
            <li>
              <span>Email</span>
              <b>{p.email}</b>
              <button type="button" className="mini" onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </li>
            <li>
              <span>Phone</span>
              <b>{p.phone}</b>
            </li>
            <li>
              <span>Location</span>
              <b>{p.location}</b>
            </li>
            <li>
              <span>LinkedIn</span>
              <a href={p.linkedin} target="_blank" rel="noreferrer">
                linkedin.com/in/Anbuselvan-3b19a1337
              </a>
            </li>
            <li>
              <span>GitHub</span>
              <a href={p.github} target="_blank" rel="noreferrer">
                github.com/anbuselvan-cell
              </a>
            </li>
          </ul>
        </div>

        <form className="slab form" onSubmit={submit} noValidate>
          <label htmlFor="c-name">Your name</label>
          <input id="c-name" name="name" value={form.name} onChange={onChange} autoComplete="name" required maxLength={80} />
          <label htmlFor="c-email">Your email</label>
          <input id="c-email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" required maxLength={120} />
          <label htmlFor="c-message">Message</label>
          <textarea id="c-message" name="message" rows={5} value={form.message} onChange={onChange} required maxLength={2000} />
          <button className="btn solid" type="submit" disabled={state.s === 'sending'}>
            {state.s === 'sending' ? 'Sending' : 'Send message'}
          </button>
          <p className={`note ${state.s}`} role="status" aria-live="polite">
            {state.m}
          </p>
        </form>
      </div>
    </section>
  );
}

export default function App() {
  const [data, setData] = useState(bundled);
  const [source, setSource] = useState('loading');
  const scroll = useRef(0);

  useEffect(() => {
    let live = true;
    loadPortfolio().then((r) => {
      if (!live) return;
      setData(r.data);
      setSource(r.source);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const { profile, education, skills, projects, journey, certificates } = data;

  return (
    <>
      <div className="stage" aria-hidden="true">
        <Scene scroll={scroll} />
      </div>
      <Nav source={source} />
      <main>
        <Hero p={profile} education={education} />
        <About p={profile} education={education} soft={skills.soft} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Journey journey={journey} certificates={certificates} />
        <Contact p={profile} />
      </main>
      <footer className="foot wrap">
        <span>Anbuselvan T / B.Tech Information Technology</span>
        <span>Built with React, Three.js, Node.js and MongoDB</span>
      </footer>
    </>
  );
}
