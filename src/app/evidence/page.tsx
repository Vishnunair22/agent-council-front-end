"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EvidencePage() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Sound Effect using Web Audio API
    const playSuccessSound = useCallback(() => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }, []);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            playSuccessSound();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            playSuccessSound();
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 cursor-pointer"
            onClick={() => router.push('/')}
        >
            <header className="absolute top-0 w-full p-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-900">FC</div>
                    <span className="text-xl font-bold tracking-tight">Forensic Council</span>
                </div>
            </header>

            <main
                className="w-full max-w-2xl flex flex-col items-center gap-8 cursor-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold mb-4">Evidence Intake</h1>
                    <p className="text-slate-400">Upload digital media for forensic analysis.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-full"
                >
                    <div
                        className={`relative w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${dragActive
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-white/20 hover:border-white/40 hover:bg-white/5"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={onButtonClick}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={handleChange}
                            accept="image/*,video/*"
                        />

                        <AnimatePresence mode="wait">
                            {file ? (
                                <motion.div
                                    key="file-uploaded"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex flex-col items-center text-emerald-400"
                                >
                                    <FileCheck className="w-16 h-16 mb-4" />
                                    <p className="font-medium text-lg text-white">{file.name}</p>
                                    <p className="text-sm text-emerald-400/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <p className="mt-4 text-xs text-slate-500">Click to replace</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload-prompt"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center text-slate-400"
                                >
                                    <Upload className={`w-12 h-12 mb-4 transition-transform duration-300 ${dragActive ? 'scale-110 text-emerald-500' : ''}`} />
                                    <p className="font-medium">Drag & drop evidence here</p>
                                    <p className="text-sm mt-2 opacity-60">or click to browse</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {file && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-emerald-500/20">
                            Initiate Analysis
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
