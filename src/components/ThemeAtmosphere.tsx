import React from 'react';
import { UXDesignId } from '../types';

interface ThemeAtmosphereProps {
  activeDesign: UXDesignId;
  darkMode: boolean;
}

export const ThemeAtmosphere: React.FC<ThemeAtmosphereProps> = ({ activeDesign, darkMode }) => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-500" 
      aria-hidden="true"
      id="theme-atmosphere-canvas"
    >
      {/* 
        High-Performance Zero-Lag Ambient Backgrounds:
        Using pure hardware CSS radial-gradients instead of expensive multi-pass Gaussian blur filters
        to eliminate GPU rasterization bottlenecks and ensure 120 FPS scrolling across all devices.
      */}

      {/* DESIGN 1: Executive Reference Match (Amber & Slate Ambient Glow) */}
      {activeDesign === 'current' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(circle at 25% 15%, rgba(245, 158, 11, 0.07) 0%, transparent 45%), radial-gradient(circle at 80% 45%, rgba(217, 119, 6, 0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 45%)'
                : 'radial-gradient(circle at 25% 15%, rgba(245, 158, 11, 0.05) 0%, transparent 45%), radial-gradient(circle at 80% 45%, rgba(217, 119, 6, 0.04) 0%, transparent 50%)'
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)',
              backgroundSize: '36px 36px'
            }}
          />
        </div>
      )}

      {/* DESIGN 2: Hybrid Clean Energy & Aerodynamic CFD Flow (Emerald & Cyan) */}
      {activeDesign === 'design-2' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(circle at 20% 15%, rgba(16, 185, 129, 0.09) 0%, transparent 45%), radial-gradient(circle at 80% 40%, rgba(6, 182, 212, 0.08) 0%, transparent 50%), radial-gradient(circle at 30% 85%, rgba(20, 184, 166, 0.07) 0%, transparent 45%)'
                : 'radial-gradient(circle at 20% 15%, rgba(16, 185, 129, 0.06) 0%, transparent 45%), radial-gradient(circle at 80% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)'
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cfdGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M -100 200 C 300 120, 600 320, 1200 180 C 1500 100, 1800 240, 2200 160" 
              fill="none" 
              stroke="url(#cfdGrad1)" 
              strokeWidth="2" 
              strokeDasharray="8 12" 
            />
            <path 
              d="M -100 500 C 350 420, 750 580, 1250 460 C 1650 380, 1950 520, 2300 440" 
              fill="none" 
              stroke="url(#cfdGrad1)" 
              strokeWidth="1.5" 
              strokeDasharray="6 14" 
            />
          </svg>
        </div>
      )}

      {/* DESIGN 3: Academic Scholar & Editorial (Imperial Indigo & Warm Amber Gold) */}
      {activeDesign === 'design-3' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(circle at 25% 15%, rgba(67, 56, 202, 0.12) 0%, transparent 45%), radial-gradient(circle at 75% 45%, rgba(217, 119, 6, 0.08) 0%, transparent 50%)'
                : 'radial-gradient(circle at 25% 15%, rgba(67, 56, 202, 0.06) 0%, transparent 45%), radial-gradient(circle at 75% 45%, rgba(217, 119, 6, 0.05) 0%, transparent 50%)'
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)',
              backgroundSize: '48px 48px'
            }}
          />
        </div>
      )}

      {/* DESIGN 4: Nordic Slate Glassmorphism (Arctic Mist & Soft Azure) */}
      {activeDesign === 'design-4' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.09) 0%, transparent 45%), radial-gradient(circle at 80% 50%, rgba(30, 41, 59, 0.2) 0%, transparent 55%)'
                : 'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.06) 0%, transparent 45%), radial-gradient(circle at 80% 50%, rgba(148, 163, 184, 0.08) 0%, transparent 55%)'
            }}
          />
        </div>
      )}

      {/* DESIGN 5: Personal Studio — balanced teal depth with a warm coral lift */}
      {activeDesign === 'design-5' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(circle at 18% 12%, rgba(20, 184, 166, 0.15) 0%, transparent 45%), radial-gradient(circle at 82% 42%, rgba(249, 115, 91, 0.08) 0%, transparent 48%), radial-gradient(circle at 38% 86%, rgba(13, 148, 136, 0.08) 0%, transparent 44%)'
                : 'radial-gradient(circle at 18% 12%, rgba(20, 184, 166, 0.07) 0%, transparent 45%), radial-gradient(circle at 82% 42%, rgba(249, 115, 91, 0.045) 0%, transparent 48%)'
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #14b8a6 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      )}

      {/* DESIGN 6: Executive Modern Luxury (Obsidian & Champagne Gold Foil) */}
      {activeDesign === 'design-6' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(circle at 25% 15%, rgba(212, 175, 55, 0.08) 0%, transparent 45%), radial-gradient(circle at 75% 45%, rgba(202, 138, 4, 0.07) 0%, transparent 50%)'
                : 'radial-gradient(circle at 25% 15%, rgba(212, 175, 55, 0.05) 0%, transparent 45%), radial-gradient(circle at 75% 45%, rgba(202, 138, 4, 0.04) 0%, transparent 50%)'
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #d4af37 1px, transparent 0)',
              backgroundSize: '42px 42px'
            }}
          />
        </div>
      )}
    </div>
  );
};
