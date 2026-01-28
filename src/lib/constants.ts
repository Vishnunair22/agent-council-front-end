import { Agent } from "@/types";

export const MOCK_AGENTS: Agent[] = [
    { name: "Image Integrity Expert", role: "Image Integrity", desc: "Detects manipulation, splicing, and GAN artifacts." },
    { name: "Scene Reconstruction Expert", role: "Scene Reconstruction", desc: "Validates lighting, shadows, and perspective physics." },
    { name: "Object & Weapon Analyst", role: "Object & Weapon", desc: "Classifies weapons and generates confidence heatmaps." },
    { name: "Temporal Video Analyst", role: "Temporal Video", desc: "Inspects frame consistency and deepfake markers." },
    { name: "Metadata & Context Expert", role: "Metadata & Context", desc: "Analyzes EXIF data and device mismatch alerts." }
];
