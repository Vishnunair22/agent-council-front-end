import { useState, useEffect, useCallback, useRef } from "react";
import { AGENTS_DATA, AgentDefinition } from "@/lib/constants";
import { AgentResult } from "@/types";

type UseSimulationProps = {
    onAgentComplete?: (result: AgentResult) => void;
    onComplete?: () => void;
    playSound?: (type: "success" | "agent" | "complete" | "think") => void;
};

export const useSimulation = ({ onAgentComplete, onComplete, playSound }: UseSimulationProps) => {
    const [status, setStatus] = useState<"idle" | "analyzing" | "agents" | "complete">("idle");
    const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
    const [isThinking, setIsThinking] = useState(false);
    const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState("");

    // Internal refs for logic management
    const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startSimulation = useCallback(() => {
        setStatus("analyzing");
    }, []);

    const resetSimulation = useCallback(() => {
        setStatus("idle");
        setCurrentAgentIndex(-1);
        setIsThinking(false);
        setCurrentThinkingPhrase("");
    }, []);

    // Main Simulation Loop
    useEffect(() => {
        if (status === "analyzing") {
            const timer = setTimeout(() => {
                setStatus("agents");
                setCurrentAgentIndex(0);
                setIsThinking(true);
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (status === "agents") {
            if (currentAgentIndex >= 0 && currentAgentIndex < AGENTS_DATA.length) {
                const agent = AGENTS_DATA[currentAgentIndex];

                if (isThinking) {
                    // Start Dynamic Thinking Phrases
                    setCurrentThinkingPhrase(agent.simulation.thinking); // Reset to default
                    let phraseIndex = 0;

                    // Rotate phrases
                    if (!thinkingIntervalRef.current && agent.simulation.thinkingPhrases) {
                        thinkingIntervalRef.current = setInterval(() => {
                            const phrases = agent.simulation.thinkingPhrases;
                            if (phrases) {
                                setCurrentThinkingPhrase(phrases[phraseIndex % phrases.length]);
                                phraseIndex++;
                            }
                        }, 800);
                    }

                    const timer = setTimeout(() => {
                        // Stop rotation
                        if (thinkingIntervalRef.current) {
                            clearInterval(thinkingIntervalRef.current);
                            thinkingIntervalRef.current = null;
                        }

                        setIsThinking(false);

                        const result: AgentResult = {
                            id: agent.id,
                            name: agent.name,
                            role: agent.role,
                            result: agent.simulation.result,
                            confidence: agent.simulation.confidence,
                            thinking: agent.simulation.thinking // Keep original thinking for display if needed
                        };

                        onAgentComplete?.(result);
                        playSound?.("agent");

                    }, 3000 + Math.random() * 500);

                    return () => {
                        clearTimeout(timer);
                        if (thinkingIntervalRef.current) {
                            clearInterval(thinkingIntervalRef.current);
                            thinkingIntervalRef.current = null;
                        }
                    };
                } else {
                    // Pause between agents
                    const timer = setTimeout(() => {
                        setCurrentAgentIndex(prev => prev + 1);
                        setIsThinking(true);

                        if (currentAgentIndex + 1 < AGENTS_DATA.length) {
                            playSound?.("think");
                        }
                    }, 800);
                    return () => clearTimeout(timer);
                }
            } else if (currentAgentIndex >= AGENTS_DATA.length) {
                const timer = setTimeout(() => {
                    setStatus("complete");
                    onComplete?.();
                    playSound?.("complete");
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [status, currentAgentIndex, isThinking, onAgentComplete, onComplete, playSound]);

    return {
        status,
        currentAgentIndex,
        isThinking,
        currentThinkingPhrase,
        startSimulation,
        resetSimulation,
        totalAgents: AGENTS_DATA.length
    };
};
