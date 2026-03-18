"use client"

export function SplitHero() {
    return (
        <section className="w-full h-[calc(100vh-108px)] md:h-[calc(100vh-72px)] min-h-[500px] relative overflow-hidden">
            {/* Main Visual Image (Full Width) */}
            <img
                src="/main_logo.jpeg"
                alt="RICH Collection"
                className="w-full h-full object-cover object-[center_30%]"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/10" />
        </section>
    )
}
