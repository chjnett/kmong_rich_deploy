"use client"

import { useEffect } from "react"
import { incrementVisitor } from "@/app/actions/visitor-actions"

export function VisitorTracker() {
    useEffect(() => {
        // Increment visitor count on the client side to avoid blocking SSR/ISR
        // and to ensure it counts even when the page is served from cache.
        incrementVisitor().catch(err => console.error("Stats tracking failed", err));
    }, []);

    return null;
}
