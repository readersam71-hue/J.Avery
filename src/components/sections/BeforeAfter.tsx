"use client";

import { useState } from "react";
import { MoveHorizontal } from "lucide-react";

export function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const container = e.currentTarget.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - container.left) / container.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Bathroom Transformations</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            See how we turn outdated, tired bathrooms into clean, modern contemporary spaces.
            Drag the slider to see the difference.
          </p>
        </div>

        <div 
          className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden cursor-ew-resize select-none"
          onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
          onTouchMove={handleMove}
          onMouseDown={handleMove}
        >
          {/* After Image (Base) */}
          <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-2xl">
            AFTER: Modern Luxury Suite
          </div>

          {/* Before Image (Overlay) */}
          <div 
            className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-2xl overflow-hidden border-r-4 border-white"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="min-w-[800px]">BEFORE: Outdated 1980s Bathroom</div>
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-900">
              <MoveHorizontal className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xl font-semibold mb-6">Want a transformation like this?</p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105">
            Book Your Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
}
