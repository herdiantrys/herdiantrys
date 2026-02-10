"use client";

import Image from "next/image";

export default function IllustrationSection() {
  return (
    <section id="projects" className="container mx-auto min-h-[600px] px-6 py-16">
          {/* Judul & Deskripsi */}
          <div className="text-right max-w-full mb-16">
            <h2
              className="text-4xl lg:text-7xl font-bold mb-4"
            >
              My <span className="text-purple-400">Works</span>
            </h2>
            <p
              className="text-gray-400"
            >
              A collection of my works across various projects and clients.
            </p>
          </div>
    </section>
  );
}