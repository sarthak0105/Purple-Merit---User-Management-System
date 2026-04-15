'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { motion, useInView } from 'framer-motion'
import { Menu, X, ArrowRight, Check, Activity, BarChart3, Zap, Shield, Users, Lock, Sun, Moon } from 'lucide-react'
import { BackgroundPaths } from '@/components/ui/background-paths'

// ── Theme toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => { setIsDark(document.documentElement.classList.contains('dark')) }, [])
  const toggle = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) { html.classList.remove('dark'); localStorage.setItem('theme','light'); setIsDark(false) }
    else { html.classList.add('dark'); localStorage.setItem('theme','dark'); setIsDark(true) }
  }
  return (
    <button onClick={toggle} className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
      {isDark ? <Sun size={16}/> : <Moon size={16}/>}
    </button>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<number|null>(null)
  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Roles', href: '#roles' },
  ]
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl"
    >
      <nav className="flex items-center justify-between px-4 py-3 rounded-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-zinc-950 font-bold text-sm">PM</span>
          </div>
          <span className="font-semibold text-white hidden sm:block">Purple Merit</span>
        </Link>
        <div className="hidden md:flex items-center gap-1 relative">
          {navItems.map((item, i) => (
            <a key={item.label} href={item.href}
              className="relative px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              {hovered === i && (
                <motion.div layoutId="nav-hover" className="absolute inset-0 bg-zinc-800 rounded-full"
                  initial={false} transition={{ type:'spring', stiffness:500, damping:30 }} />
              )}
              <span className="relative z-10">{item.label}</span>
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-full transition-colors">
                Dashboard <ArrowRight size={14}/>
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login"><button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Sign in</button></Link>
              <Link href="/login"><button className="px-4 py-2 text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-full transition-colors">Get Started</button></Link>
            </>
          )}
        </div>
        <button className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </nav>
      {open && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800">
          <div className="flex flex-col gap-2">
            {navItems.map(item => (
              <a key={item.label} href={item.href} onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                {item.label}
              </a>
            ))}
            <hr className="border-zinc-800 my-1"/>
            <Link href="/login" onClick={() => setOpen(false)}>
              <button className="w-full py-2.5 text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-full transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950 pointer-events-none"/>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-zinc-800/15 rounded-full blur-3xl pointer-events-none"/>
      {/* Animated background paths */}
      <BackgroundPaths />
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow:'0 0 6px #10b981' }}/>
          <span className="text-sm text-zinc-400">User Management System · MERN Stack</span>
        </motion.div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
          <span className="block overflow-hidden">
            <motion.span className="block" initial={{ y:'100%' }} animate={{ y:0 }} transition={{ duration:0.8, ease:[0.22,1,0.36,1], delay:0 }}>
              Manage Users.
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block text-zinc-500" initial={{ y:'100%' }} animate={{ y:0 }} transition={{ duration:0.8, ease:[0.22,1,0.36,1], delay:0.1 }}>
              Control Access.
            </motion.span>
          </span>
        </h1>
        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.5 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A production-ready admin portal with role-based access control, JWT authentication, and real-time dashboards. Built with Next.js, Express, and MongoDB Atlas.
        </motion.p>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/login">
            <button className="flex items-center gap-2 px-8 h-12 text-base font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-full shadow-lg shadow-white/10 transition-all hover:-translate-y-0.5">
              Start Managing <ArrowRight className="w-4 h-4"/>
            </button>
          </Link>
          <Link href="/login">
            <button className="flex items-center gap-2 px-8 h-12 text-base font-medium border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 rounded-full transition-all">
              View Demo
            </button>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.7 }}
          className="flex items-center justify-center gap-8 flex-wrap">
          {[['3','User Roles'],['12','Permissions'],['JWT','Auth'],['Atlas','Database']].map(([v,l]) => (
            <div key={l} className="text-center">
              <p className="text-2xl font-bold text-white">{v}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
// ── Bento Grid Features ───────────────────────────────────────────────────────
function BentoGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-100px' })
  const cards = [
    { icon: Users, title:'User Management', desc:'Create, edit, delete users. Search and filter by role or status with real-time pagination.', wide:true },
    { icon: Shield, title:'Role-Based Access', desc:'Admin, Manager, User roles with 12 granular permissions across 4 categories.' },
    { icon: Lock, title:'JWT Authentication', desc:'Secure token-based auth with bcrypt hashing and automatic session management.' },
    { icon: BarChart3, title:'Live Dashboard', desc:'Real-time stats from MongoDB Atlas with activity logs and role distribution.' },
    { icon: Zap, title:'Fast API', desc:'Express backend with rate limiting, CORS, and Zod validation on every endpoint.' },
    { icon: Activity, title:'Audit Ready', desc:'Every action is tracked. User creation, role changes, and profile edits logged.' },
  ]
  return (
    <section id="features" className="py-24 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Built for modern teams. Powerful features that help you manage users, roles, and permissions at scale.</p>
        </motion.div>
        <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div key={card.title}
              variants={{ hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0, transition:{ duration:0.6, ease:[0.22,1,0.36,1] } } }}
              className={`group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300 ${card.wide ? 'md:col-span-2 lg:col-span-1' : ''}`}>
              <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
                <card.icon className="w-5 h-5 text-zinc-400" strokeWidth={1.5}/>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
// ── Roles Section ─────────────────────────────────────────────────────────────
function RolesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-100px' })
  const roles = [
    { name:'Admin', badge:'bg-purple-500/20 text-purple-400 border border-purple-500/30', desc:'Full system access. Create, edit, delete users and roles.', perms:['Create & delete users','Manage all roles','Edit system settings','View all stats','Full API access'] },
    { name:'Manager', badge:'bg-blue-500/20 text-blue-400 border border-blue-500/30', desc:'User management access. View and edit users but not create them.', perms:['View all users','Edit user details','View roles','View dashboard','Export data'] },
    { name:'User', badge:'bg-zinc-700 text-zinc-400 border border-zinc-600', desc:'Basic access. View dashboard and manage own profile.', perms:['View dashboard','Edit own profile','View own settings'] },
  ]
  return (
    <section id="roles" className="py-24 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Three roles, clear boundaries</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Each role has a specific set of permissions. No overlap, no confusion.</p>
        </motion.div>
        <motion.div ref={ref} initial={{ opacity:0, y:40 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.6, delay:0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <motion.div key={role.name} initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ duration:0.6, delay:0.3 + i*0.1 }}
              className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-zinc-800"><Shield className="w-4 h-4 text-zinc-400" strokeWidth={1.5}/></div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${role.badge}`}>{role.name}</span>
              </div>
              <p className="text-zinc-400 text-sm mb-5 leading-relaxed">{role.desc}</p>
              <ul className="space-y-2.5">
                {role.perms.map(p => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.5}/>{p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-100px' })
  return (
    <section className="py-24 px-4 bg-zinc-950">
      <motion.div ref={ref} initial={{ opacity:0, y:40 }} animate={inView ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.8, ease:[0.22,1,0.36,1] }}
        className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">Ready to get started?</h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Sign in with the demo credentials and explore the full system. Admin, Manager, and User roles available.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <button className="flex items-center gap-2 px-8 h-14 text-base font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-full shadow-lg shadow-white/20 transition-all hover:-translate-y-0.5">
              Sign in <ArrowRight className="w-5 h-5"/>
            </button>
          </Link>
          <Link href="/login">
            <button className="flex items-center gap-2 px-8 h-14 text-base font-medium border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 rounded-full transition-all">
              View as Manager
            </button>
          </Link>
        </div>
        <p className="mt-8 text-sm text-zinc-500">Demo password: <span className="font-mono text-zinc-400">password123</span></p>
      </motion.div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-50px' })
  const links = {
    Product: ['Features','Roles','Security','Pricing'],
    Resources: ['Documentation','API Docs','GitHub','Changelog'],
    Company: ['About','Contact','Privacy','Terms'],
  }
  return (
    <footer ref={ref} className="border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-zinc-950 font-bold text-sm">PM</span>
              </div>
              <span className="font-semibold text-white">Purple Merit</span>
            </Link>
            <p className="text-sm text-zinc-500 mb-4">Enterprise user management built with Next.js, Express, and MongoDB Atlas.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow:'0 0 6px #10b981' }}/>
              <span className="text-xs text-zinc-400">All Systems Operational</span>
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item}><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ duration:0.6, delay:0.3 }}
          className="mt-16 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} Purple Merit. All rights reserved.</p>
          <p className="text-sm text-zinc-500">Built with Next.js · Express · MongoDB Atlas</p>
        </motion.div>
      </div>
    </footer>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <Hero />
      <BentoGrid />
      <RolesSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}