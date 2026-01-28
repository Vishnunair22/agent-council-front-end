import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, CheckCircle, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForensicData } from "@/hooks/useForensicData";
import { AgentResult } from "@/types";
import { AgentIcon } from "@/components/ui/AgentIcon";
import { AGENTS_DATA } from "@/lib/constants";

export default function EvidencePage() {
    const router = useRouter();
    const { saveCurrentReport, addToHistory } = useForensicData();

    // --- State ---
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Workflow States
    const [status, setStatus] = useState<"idle" | "analyzing" | "agents" | "complete">("idle");
    const [completedAgents, setCompletedAgents] = useState<AgentResult[]>([]);
    const [currentAgentIndex, setCurrentAgentIndex] = useState(-1); // -1 not started
    const [isThinking, setIsThinking] = useState(false); // New state to show "Thinking..." before result

    const inputRef = useRef<HTMLInputElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // --- Audio ---
    const playSound = useCallback((type: "success" | "agent" | "complete" | "think") => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }

        const ctx = audioCtxRef.current;
        if (!ctx) return;

        // Resume if suspended (browser auto-play policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "success") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === "agent") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === "think") {
            // Subtle low blip for thinking start
            osc.type = "sine";
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
        } else if (type === "complete") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        }
    }, []);

    // --- Handlers ---
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            playSound("success");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            playSound("success");
        }
    };

    const startAnalysis = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStatus("analyzing");
    };

    const resetAnalysis = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setStatus("idle");
        setCompletedAgents([]);
        setCurrentAgentIndex(-1);
        setIsThinking(false);
    };

    const acceptAnalysis = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Strip extra properties (thinking, icon) for storage
        const cleanAgents: AgentResult[] = completedAgents.map(a => ({
            id: a.id,
            name: a.name,
            role: a.role,
            result: a.result,
            confidence: a.confidence
        }));

        const reportData = {
            id: Date.now().toString(),
            fileName: file?.name || "Unknown File",
            timestamp: new Date().toISOString(),
            summary: "Comprehensive multi-agent extraction complete. All data streams verified and cross-referenced.",
            agents: cleanAgents
        };

        saveCurrentReport(reportData);
        addToHistory(reportData);

        router.push('/result');
    };


    // --- Simulation Logic ---
    useEffect(() => {
        if (status === "analyzing") {
            // Step 1: "Initializing..." -> Start Agents
            const timer = setTimeout(() => {
                setStatus("agents");
                setCurrentAgentIndex(0);
                setIsThinking(true);
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (status === "agents") {
            if (currentAgentIndex >= 0 && currentAgentIndex < AGENTS_DATA.length) {
                if (isThinking) {
                    // "Thinking" Phase
                    // Show "Agent is thinking..." for 3s, then reveal result
                    const timer = setTimeout(() => {
                        setIsThinking(false);
                        // Reveal the card
                        const agentDef = AGENTS_DATA[currentAgentIndex];
                        setCompletedAgents(prev => [...prev, {
                            id: agentDef.id,
                            name: agentDef.name,
                            role: agentDef.role,
                            result: agentDef.simulation.result,
                            confidence: agentDef.simulation.confidence,
                            thinking: agentDef.simulation.thinking
                        }]);
                        playSound("agent");
                    }, 3000 + Math.random() * 500); // 3s delay as requested
                    return () => clearTimeout(timer);
                } else {
                    // "Next Agent" Phase
                    // Pause briefly after reveal before starting next agent
                    const timer = setTimeout(() => {
                        setCurrentAgentIndex(prev => prev + 1);
                        setIsThinking(true); // Start thinking for next agent
                        if (currentAgentIndex + 1 < AGENTS_DATA.length) {
                            playSound("think");
                        }
                    }, 800);
                    return () => clearTimeout(timer);
                }
            } else if (currentAgentIndex >= AGENTS_DATA.length) {
                // All done
                const timer = setTimeout(() => {
                    setStatus("complete");
                    playSound("complete");
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [status, currentAgentIndex, isThinking, playSound]);


    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 cursor-pointer overflow-hidden"
            onClick={() => router.push('/')}
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-black to-black -z-50" />

            <header className="absolute top-0 w-full p-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-900">FC</div>
                    <span className="text-xl font-bold tracking-tight">Forensic Council</span>
                </div>
            </header>

            <main
                className="w-full max-w-4xl flex flex-col items-center gap-8 cursor-auto z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- Header --- */}
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center w-full max-w-md"
                >
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">Evidence Intake</h1>
                    <p className="text-slate-400 h-6 min-h-[1.5rem] flex items-center justify-center gap-2 mb-4">
                        {status === "idle" && "Upload digital media for forensic analysis."}
                        {status === "analyzing" && (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Initializing autonomous agents...
                            </>
                        )}
                        {status === "agents" && isThinking && (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                <span className="animate-pulse text-emerald-500">
                                    {AGENTS_DATA[currentAgentIndex]?.name} is {AGENTS_DATA[currentAgentIndex]?.simulation.thinking.toLowerCase() || "processing..."}
                                </span>
                            </>
                        )}
                        {status === "agents" && !isThinking && (
                            <span className="text-slate-500">Result generated.</span>
                        )}
                        {status === "complete" && "Analysis Complete. Review findings below."}
                    </p>

                    {/* Progress Bar */}
                    {(status === "agents" || status === "analyzing") && (
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-8">
                            <motion.div
                                className="bg-emerald-500 h-full"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${((Math.max(0, currentAgentIndex) + (isThinking ? 0.5 : 1)) / AGENTS_DATA.length) * 100}%`
                                }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                    )}
                </motion.div>


                {/* --- Upload Zone (Hidden when analyzing starts) --- */}
                <AnimatePresence>
                    {status === "idle" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                            className="w-full max-w-2xl"
                        >
                            <div
                                className={`relative w-full h-48 md:h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${dragActive
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
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

                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center mt-6 w-full md:w-auto"
                                >
                                    <button
                                        onClick={startAnalysis}
                                        className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-emerald-500/20"
                                    >
                                        Initiate Analysis
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* --- Analysis Grid --- */}
                {(status === "agents" || status === "complete") && (
                    <motion.div
                        className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
                        layout
                    >
                        <AnimatePresence>
                            {completedAgents.map((agent, i) => (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    // Stagger effect naturally happens because items are added over time
                                    className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg flex items-start space-x-4 shadow-xl"
                                >
                                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                        <AgentIcon role={agent.role} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white relative flex items-center gap-2">
                                            {agent.name}
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 uppercase tracking-wider">{agent.role}</span>
                                        </h3>
                                        <p className="text-sm text-slate-300 mt-1 leading-relaxed">{agent.result}</p>
                                        <div className="mt-3 flex items-center text-emerald-500 text-xs font-mono font-bold">
                                            <CheckCircle className="w-3 h-3 mr-1" /> CONFIDENCE: {agent.confidence}%
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Thinking Card (Current Agent) - Only show if current agent is thinking */}
                            {status === "agents" && isThinking && currentAgentIndex < AGENTS_DATA.length && (
                                <motion.div
                                    key="thinking"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-5 rounded-2xl bg-white/5 border border-white/5 border-dashed flex items-center justify-center space-x-3 text-slate-500 min-h-[140px]"
                                >
                                    <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                    <span className="animate-pulse">
                                        {AGENTS_DATA[currentAgentIndex]?.name} processing...
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* --- Completion Actions --- */}
                {status === "complete" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-4 mt-4 w-full md:w-auto"
                    >
                        <button
                            onClick={resetAnalysis}
                            className="w-full md:w-auto px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Analyse Again
                        </button>
                        <button
                            onClick={acceptAnalysis}
                            className="w-full md:w-auto px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                        >
                            Accept Analysis <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

            </main>
        </div>
    );
}
