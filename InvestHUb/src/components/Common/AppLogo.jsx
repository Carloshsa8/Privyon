import React from 'react';

export const AppLogoIcon = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 
        High-Fidelity Investment Knot Reconstruction
        Based on the reference image with 'gaps' and 'overlaps'
      */}
      
      {/* Top Left Corner Segment */}
      <path 
        d="M50 15 H25 C19.4772 15 15 19.4772 15 25 V50" 
        stroke="currentColor" strokeWidth="6" strokeLinecap="round" 
      />
      
      {/* Bottom Left Corner Segment */}
      <path 
        d="M15 50 V75 C15 80.5228 19.4772 85 25 85 H50" 
        stroke="currentColor" strokeWidth="6" strokeLinecap="round" 
      />

      {/* Bottom Right Corner Segment */}
      <path 
        d="M50 85 H75 C80.5228 85 85 80.5228 85 75 V50" 
        stroke="currentColor" strokeWidth="6" strokeLinecap="round" 
      />

      {/* Top Right Corner Segment */}
      <path 
        d="M85 50 V25 C85 19.4772 80.5228 15 75 15 H50" 
        stroke="currentColor" strokeWidth="6" strokeLinecap="round" 
      />

      {/* Center Circle */}
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      
      {/* Diagonal Growth Arrow - Cutting through the gaps */}
      <path 
        d="M28 72 L50 50 L72 28 M60 28 H72 V40" 
        stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" 
      />
      
      {/* Bar Charts (The fine details) */}
      {/* Top Section Chart */}
      <path d="M30 35 V42 M38 28 V42 M46 35 V42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      
      {/* Bottom Section Chart */}
      <path d="M54 58 V65 M62 58 V72 M70 58 V65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};

export const AppLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="flex items-center justify-center p-1.5 rounded-xl shadow-lg"
        style={{ 
          backgroundColor: 'transparent',
          color: 'var(--accent-hex)'
        }}
      >
        <AppLogoIcon size={32} />
      </div>
      <div className="flex flex-col -gap-1">
        <span className="text-xl font-bold tracking-tight text-light-primary dark:text-dark-primary leading-none">
          Invest<span style={{ color: 'var(--accent-hex)' }}>Hub</span>
        </span>
        <span className="text-[8px] uppercase tracking-[0.3em] opacity-40 font-bold">Smart Portfolio</span>
      </div>
    </div>
  );
};
