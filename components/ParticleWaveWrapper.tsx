"use client";

import dynamic from "next/dynamic";

const ParticleWave = dynamic(() => import("./ParticleWave"), { ssr: false });

export default function ParticleWaveWrapper() {
    return <ParticleWave />;
}
