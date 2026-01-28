import { useState, useEffect } from "react";
import { Report } from "@/types";
import { HistorySchema, ReportSchema } from "@/lib/schemas";

const HISTORY_KEY = "fc_history";
const CURRENT_REPORT_KEY = "fc_current_report";

export const useForensicData = () => {
    const [history, setHistory] = useState<Report[]>([]);
    const [currentReport, setCurrentReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            const savedCurrent = localStorage.getItem(CURRENT_REPORT_KEY);

            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                const validated = HistorySchema.safeParse(parsed);
                if (validated.success) {
                    setHistory(validated.data);
                } else {
                    console.error("History data invalid", validated.error);
                }
            }

            if (savedCurrent) {
                const parsed = JSON.parse(savedCurrent);
                const validated = ReportSchema.safeParse(parsed);
                if (validated.success) {
                    setCurrentReport(validated.data);
                } else {
                    console.error("Current report data invalid", validated.error);
                }
            }
        } catch (error) {
            console.error("Failed to load forensic data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveCurrentReport = (report: Report) => {
        // Clean up report if needed (already handled by types usually, but good to be safe)
        setCurrentReport(report);
        localStorage.setItem(CURRENT_REPORT_KEY, JSON.stringify(report));
    };

    const addToHistory = (report: Report) => {
        const newHistory = [report, ...history];
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };

    const deleteFromHistory = (id: string) => {
        const newHistory = history.filter(h => h.id !== id);
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

    return {
        history,
        currentReport,
        isLoading,
        saveCurrentReport,
        addToHistory,
        deleteFromHistory,
        clearHistory
    };
};
