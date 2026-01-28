"use client";

import { motion } from "framer-motion";
import { Shield, Search, Layout, Database, Video, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  // Agent data mapped from your PRD 
  const agents = [
    { name: "Image Integrity Expert", icon: <Shield />, desc: "Detects manipulation, splicing, and GAN artifacts." },
    { name: "Scene Reconstruction Expert", icon: <Search />, desc: "Validates lighting, shadows, and perspective physics." },
    { name: "Object & Weapon Analyst", icon: <Layout />, desc: "Classifies weapons and generates confidence heatmaps." },
    { name: "Temporal Video Analyst", icon: <Video />, desc: "Inspects frame consistency and deepfake markers." },
    { name: "Metadata & Context Expert", icon: <Database />, desc: "Analyzes EXIF data and device mismatch alerts." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* --- Header Section --- */}
      <header className="p-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-black/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-900">FC</div>
          <span className="text-xl font-bold tracking-tight">Forensic Council</span>
        </div>
      </header>

      {/* --- Hero Section ---  */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold max-w-4xl mb-6 tracking-tighter"
        >
          Multi-Agent Forensic Evidence Analysis System
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 max-w-2xl text-lg mb-10"
        >
          This system leverages multiple intelligent agents that analyze digital forensic evidence and compile those insights into a cohesive report.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Link href="/evidence" className="group relative px-8 py-4 bg-emerald-600 text-white font-bold rounded-full overflow-hidden transition-all hover:bg-emerald-500 inline-block">
            <span className="relative z-10 flex items-center">
              Begin Analysis <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </section>

      {/* --- Meet the Agents ---  */}
      <section className="py-20 px-6 bg-slate-900/50">
        <h2 className="text-3xl font-bold text-center mb-12">Meet the Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {agents.map((agent, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slate-800/50 border border-white/5 flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors"
            >
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl mb-4">
                {agent.icon}
              </div>
              <h3 className="font-semibold text-sm mb-2">{agent.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{agent.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- How it Works ---  */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-16">How the Forensic Council Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Evidence Intake", desc: "Upload digital media including CCTV, photos, or mobile evidence." },
            { step: "02", title: "Agent Consultation", desc: "Specialized agents analyze data and resolve contradictions." },
            { step: "03", title: "Final Verdict", desc: "A cohesive, legal-ready report is synthesized for review." }
          ].map((item, i) => (
            <div key={i} className="relative p-6">
              <span className="text-6xl font-black text-white/5 absolute -top-4 left-1/2 -translate-x-1/2 select-none">{item.step}</span>
              <h4 className="text-xl font-bold mb-3 relative z-10">{item.title}</h4>
              <p className="text-slate-400 text-sm relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer ---  */}
      <footer className="mt-auto py-10 border-t border-white/5 text-center px-6">
        <p className="text-slate-500 text-sm">
          Forensic Council is an academic project.
        </p>
      </footer>
    </div>
  );
}
