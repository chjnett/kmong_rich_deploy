"use client"

import { useState, useRef, useEffect } from "react"
import { Music, Music2, Volume2, VolumeX, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

const SONGS = [
    "Forbidden Love - K'Cherie - Topic (128k).mp3",
    "Jenevieve - Love Quotes [Official Audio] - Jenevieve (128k).mp3",
    "Like i do - J.Tajor.mp3",
    "THEY. - Play Fight with Tinashe (Official Lyric Video) - THEY. (128k).mp3"
]

export function BackgroundMusic() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrackIndex, setCurrentTrackIndex] = useState(Math.floor(Math.random() * SONGS.length))
    const [isMuted, setIsMuted] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [hasInteracted, setHasInteracted] = useState(false)

    useEffect(() => {
        // Shuffle playlist indices initially
        setCurrentTrackIndex(Math.floor(Math.random() * SONGS.length))
    }, [])

    useEffect(() => {
        const handleRemotePlay = () => {
            if (audioRef.current && !isPlaying) {
                audioRef.current.play().catch(() => { })
                setIsPlaying(true)
                setHasInteracted(true)
            }
        }

        window.addEventListener('play-bg-music', handleRemotePlay)
        return () => window.removeEventListener('play-bg-music', handleRemotePlay)
    }, [isPlaying])

    const togglePlay = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play().catch(err => console.log("Autoplay prevented:", err))
        }
        setIsPlaying(!isPlaying)
        setHasInteracted(true)
    }

    const nextTrack = () => {
        const nextIndex = (currentTrackIndex + 1) % SONGS.length
        setCurrentTrackIndex(nextIndex)
        // Auto play next track if it was already playing
        if (isPlaying) {
            setTimeout(() => {
                audioRef.current?.play().catch(() => { })
            }, 100)
        }
    }

    const toggleMute = () => {
        if (!audioRef.current) return
        audioRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    // Handle song end to loop/randomly play next
    const handleEnded = () => {
        nextTrack()
    }

    return (
        <div className="fixed bottom-24 right-5 z-[60] flex flex-col items-end gap-2 md:bottom-10 md:right-10">
            <audio
                ref={audioRef}
                src={`/${SONGS[currentTrackIndex]}`}
                onEnded={handleEnded}
            />

            <div className={cn(
                "flex items-center gap-2 overflow-hidden rounded-full bg-white/10 p-1.5 backdrop-blur-xl border border-white/20 transition-all duration-500 shadow-2xl",
                hasInteracted ? "w-auto max-w-[200px]" : "w-11"
            )}>
                <button
                    onClick={togglePlay}
                    className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-all group",
                        isPlaying ? "bg-black text-white" : "bg-white text-black"
                    )}
                >
                    {isPlaying ? <Music className="h-4 w-4 animate-pulse" /> : <Music2 className="h-4 w-4" />}
                </button>

                {hasInteracted && (
                    <div className="flex items-center gap-2 px-1">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-black/40">Now Playing</span>
                            <span className="text-[10px] font-bold text-black truncate max-w-[100px]">
                                {SONGS[currentTrackIndex].split(' - ')[0]}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button onClick={toggleMute} className="p-1 hover:bg-black/5 rounded-full">
                                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </button>
                            <button onClick={handleEnded} className="p-1 hover:bg-black/5 rounded-full">
                                <SkipForward className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {!hasInteracted && (
                <div className="pointer-events-none absolute -left-28 top-1/2 -translate-y-1/2 animate-bounce">
                    <span className="rounded-sm bg-black px-2 py-1 text-[8px] font-bold tracking-[0.2em] text-white uppercase shadow-lg before:absolute before:left-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-l-black">Click To play</span>
                </div>
            )}
        </div>
    )
}
