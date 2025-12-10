"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

export const ModalVideoPlayer = ({ src }: { src: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    return (
        <div className="w-full h-full relative bg-black group">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                controls
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-10"
                    onClick={handlePlayPause}
                >
                    <div className="w-20 h-20 rounded-full glass flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 hover:scale-110 transition-transform duration-300">
                        <Play size={32} className="text-white fill-white ml-2" />
                    </div>
                </div>
            )}
        </div>
    );
};
