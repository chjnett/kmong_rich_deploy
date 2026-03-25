"use client"

import { useEffect } from "react"
import { incrementVisitor } from "@/app/actions/visitor-actions"

export function VisitorTracker() {
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `visited_${today}`;

        // Only increment if not already visited today
        if (!localStorage.getItem(storageKey)) {
            incrementVisitor()
                .then(() => {
                    localStorage.setItem(storageKey, 'true');
                    // Cleanup old keys to save space (optional but good practice)
                    try {
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key?.startsWith('visited_') && key !== storageKey) {
                                localStorage.removeItem(key);
                            }
                        }
                    } catch (e) { /* ignore storage errors */ }
                })
                .catch(err => console.error("Stats tracking failed", err));
        }
    }, []);

    return null;
}
