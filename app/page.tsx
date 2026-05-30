'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Calendar, 
  Kanban, 
  Mic, 
  Palette, 
  FolderHeart, 
  CheckCircle2, 
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Optional: Auto-redirect logged-in users to dashboard
  // useEffect(() => {
  //   if (isLoaded && isSignedIn) {
  //     router.push('/dashboard');
  //   }
  // }, [isLoaded, isSignedIn, router]);
  const features = [
    {
      icon: <Bot className="w-6 h-6 text-accent-primary" />,
      title: "AI Assistant",
      desc: "Chat with your workspace, generate summaries, and trigger automatic tasks through natural language."
    },
    {
      icon: <Calendar className="w-6 h-6 text-accent-secondary" />,
      title: "Smart Calendar",
      desc: "Drag & drop scheduling, hourly planner views, and a dedicated scratchpad for draft reminders."
    },
    {
      icon: <Kanban className="w-6 h-6 text-accent-green" />,
      title: "Kanban Board",
      desc: "Real-time task planning powered by LiveBlocks. Features custom categories and inline comments."
    },
    {
      icon: <Mic className="w-6 h-6 text-accent-rose" />,
      title: "Voice Notes",
      desc: "Real-time speech-to-text transcriptions via AssemblyAI streaming. Speak directly to write your ideas."
    },
    {
      icon: <Palette className="w-6 h-6 text-accent-amber" />,
      title: "AI Whiteboard",
      desc: "Excalidraw canvas integrated with Gemini. Type layout prompts and get vector diagrams instantly."
    },
    {
      icon: <FolderHeart className="w-6 h-6 text-purple-400" />,
      title: "Spaces & Pages",
      desc: "A collaborative document archive. Group related pages inside beautiful customizable folders."
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-accent-primary/30 select-none">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-accent-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-border bg-bg-primary/70 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="text-2xl font-bold text-text-gradient font-display flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent-primary" />
          <span>Spark</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text-primary transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          {isLoaded && isSignedIn && user ? (
            <>
              <span className="text-sm text-text-secondary hidden sm:inline">
                Welcome, {user.firstName || user.emailAddresses?.[0]?.emailAddress}
              </span>
              <Link href="/dashboard" className="button-primary text-sm py-1.5 px-4 flex items-center gap-1.5 shadow-glow">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-lg border border-border',
                  }
                }}
              />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="button-ghost text-sm py-1.5 px-4">
                Sign In
              </Link>
              <Link href="/sign-up" className="button-primary text-sm py-1.5 px-4 flex items-center gap-1.5 shadow-glow">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-6xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/20 px-3 py-1.5 rounded-full text-xs font-semibold text-accent-primary">
            <Zap className="w-3.5 h-3.5" />
            <span>Introducing Spark 1.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight max-w-4xl mx-auto">
            Your Entire Workflow.<br />
            <span className="text-text-gradient">One Intelligent Space.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
            Spark combines an AI assistant, calendar, task board, voice notes, and canvas into a unified collaborative environment.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href="/sign-up" className="button-primary py-3 px-8 text-base flex items-center gap-2 shadow-glow w-full sm:w-auto justify-center">
              <span>Start For Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="button-ghost py-3 px-8 text-base w-full sm:w-auto justify-center flex">
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Floating Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-16 border border-border bg-bg-card rounded-2xl p-2 shadow-2xl glass-effect max-w-4xl mx-auto relative overflow-hidden"
        >
          <div className="h-6 w-full flex items-center gap-1.5 px-3 border-b border-border bg-bg-secondary/50">
            <div className="w-3 h-3 rounded-full bg-accent-rose/70" />
            <div className="w-3 h-3 rounded-full bg-accent-amber/70" />
            <div className="w-3 h-3 rounded-full bg-accent-green/70" />
          </div>
          <div className="aspect-[16/9] bg-bg-primary/95 flex flex-col items-center justify-center p-8 text-left border border-border/50 rounded-b-xl relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="space-y-4 max-w-lg text-center z-10">
              <Sparkles className="w-12 h-12 text-accent-primary mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold">Interactive Dashboard Shell</h3>
              <p className="text-text-secondary text-sm">
                Get an organized dashboard showing calendar strips, collaborative cards, voice records, and templates generated live by our intelligent builder.
              </p>
              <div className="pt-2">
                <Link href="/sign-in" className="button-primary text-xs py-2 px-6">
                  Launch App
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 border-t border-border bg-bg-secondary/40 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display">Crafted for Visual Excellence</h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Every tool integrates together, driven by a powerful system prompt and real-time synchronizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div 
                key={idx}
                className="card p-6 flex flex-col gap-4 group hover:border-accent-primary/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="p-3 bg-bg-secondary w-fit rounded-xl border border-border">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold font-display text-text-primary group-hover:text-accent-primary transition-colors">
                  {feat.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 border-t border-border relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3 mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-display">Work at Flow Speed</h2>
            <p className="text-text-secondary">Get set up and optimized in less than 2 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 hidden md:block z-0" />
            
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-bg-elevated border-2 border-accent-primary flex items-center justify-center font-bold text-lg text-text-primary shadow-glow">
                1
              </div>
              <h3 className="text-lg font-bold font-display">Create Account</h3>
              <p className="text-text-secondary text-xs leading-relaxed max-w-[200px]">
                Sign in with Clerk securely. Set up your space categories in seconds.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-bg-elevated border-2 border-accent-secondary flex items-center justify-center font-bold text-lg text-text-primary shadow-glow">
                2
              </div>
              <h3 className="text-lg font-bold font-display">Sync & Organize</h3>
              <p className="text-text-secondary text-xs leading-relaxed max-w-[200px]">
                Type in tasks or dictate voice notes. Drag events across month columns.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-bg-elevated border-2 border-accent-green flex items-center justify-center font-bold text-lg text-text-primary shadow-glow">
                3
              </div>
              <h3 className="text-lg font-bold font-display">Ask the AI</h3>
              <p className="text-text-secondary text-xs leading-relaxed max-w-[200px]">
                Generate diagrams, summarize pages, and create apps live with Gemini commands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border bg-bg-secondary/30 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display">Simple Pricing Plans</h2>
            <p className="text-text-secondary">Start free, upgrade for unlimited workspace capabilities.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="card p-8 flex flex-col justify-between border-border relative">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-display text-text-primary">Free Plan</h3>
                  <p className="text-text-secondary text-xs mt-1">Get standard features to plan your days.</p>
                </div>
                <div className="text-4xl font-bold font-display text-text-primary">
                  $0 <span className="text-xs text-text-secondary font-medium">/ month</span>
                </div>
                <div className="border-t border-border pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <span>3 boards & 25 tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <span>10 notes & 10 spaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <span>5 AI actions daily limit</span>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <Link href="/sign-up" className="button-ghost w-full py-2.5 text-center font-medium block">
                  Sign Up Free
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="card p-8 flex flex-col justify-between border-accent-primary shadow-glow relative bg-bg-card">
              <div className="absolute top-4 right-4 bg-accent-primary/20 border border-accent-primary/30 px-2 py-0.5 rounded text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-display text-text-primary">Pro Plan</h3>
                  <p className="text-text-secondary text-xs mt-1">Unleash the full potential of your business.</p>
                </div>
                <div className="text-4xl font-bold font-display text-text-primary">
                  $12 <span className="text-xs text-text-secondary font-medium">/ month</span>
                </div>
                <div className="border-t border-border pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    <span>Unlimited tasks, boards & spaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    <span>Unlimited AI prompt commands</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    <span>AssemblyAI voice streaming agent</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    <span>LiveBlocks team presence</span>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <Link href="/sign-up" className="button-primary w-full py-2.5 text-center font-medium block">
                  Get Started Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-text-secondary font-semibold">
            <Sparkles className="w-5 h-5 text-accent-primary" />
            <span>Spark Workspace</span>
          </div>
          <div className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Spark. All rights reserved. Built with Next.js & Gemini.
          </div>
        </div>
      </footer>
    </div>
  );
}
