import React from 'react';

export const GatewayGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 120 120" className={className}>
    {/* Top Cap */}
    <polygon points="60,15 100,35 60,55 20,35" fill={colors.top} />
    <polygon points="20,35 60,55 60,65 20,45" fill={colors.left} />
    <polygon points="60,55 100,35 100,45 60,65" fill={colors.right} />
    {/* Inset Band */}
    <polygon points="22,46 60,65 60,70 22,51" fill={colors.dark} />
    <polygon points="60,65 98,46 98,51 60,70" fill={colors.dark} />
    {/* Lower Body */}
    <polygon points="20,50 60,70 60,105 20,85" fill={colors.left} />
    <polygon points="60,70 100,50 100,85 60,105" fill={colors.right} />
    {/* Activity Lights */}
    <circle cx="35" cy="72" r="3" fill={colors.glow} />
    <circle cx="35" cy="82" r="3" fill={colors.glow} />
  </svg>
);

export const DatabaseGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 120 120" className={className}>
    {/* Stacked Cylinders from Bottom to Top */}
    {[85, 65, 45, 25].map((y, index) => (
      <g key={y}>
        <path d={`M 20,${y} L 20,${y+15} A 40 20 0 0 0 100,${y+15} L 100,${y} Z`} fill={colors.right} />
        <ellipse cx="60" cy={y} rx="40" ry="20" fill={colors.top} />
        {/* Drive Bay Handle */}
        <path d={`M 50,${y+11} Q 60,${y+15} 70,${y+11} L 70,${y+13} Q 60,${y+17} 50,${y+13} Z`} fill={colors.dark} opacity="0.5"/>
        {/* Blinking Light on top disk */}
        {index === 3 && <circle cx="85" cy={y} r="2.5" fill={colors.glow} />}
      </g>
    ))}
  </svg>
);

export const ServiceGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 120 120" className={className}>
    {/* 3 Separated Server Blades */}
    {[15, 45, 75].map((y) => (
      <g key={y}>
        <polygon points={`60,${y} 100,${y+20} 60,${y+40} 20,${y+20}`} fill={colors.top} />
        <polygon points={`20,${y+20} 60,${y+40} 60,${y+50} 20,${y+30}`} fill={colors.left} />
        <polygon points={`60,${y+40} 100,${y+20} 100,${y+30} 60,${y+50}`} fill={colors.right} />
        {/* Blade Slots & Dots */}
        <line x1="25" y1={y+28} x2="45" y2={y+38} stroke={colors.dark} strokeWidth="2.5" />
        <circle cx="75" cy={y+35} r="1.5" fill={colors.glow} />
        <circle cx="85" cy={y+30} r="1.5" fill={colors.glow} />
        <circle cx="95" cy={y+25} r="1.5" fill={colors.glow} />
      </g>
    ))}
  </svg>
);

export const WorkerGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <polygon points="60,20 100,40 60,60 20,40" fill={colors.top} />
    <polygon points="20,40 60,60 60,100 20,80" fill={colors.left} />
    <polygon points="60,60 100,40 100,80 60,100" fill={colors.right} />
    {/* Left Face Heatsink Slots */}
    <polygon points="28,52 48,62 48,65 28,55" fill={colors.dark} />
    <polygon points="28,64 48,74 48,77 28,67" fill={colors.dark} />
    <polygon points="28,76 48,86 48,89 28,79" fill={colors.dark} />
    {/* Right Face Compute Nodes */}
    <circle cx="75" cy="65" r="4" fill={colors.glow} />
    <circle cx="75" cy="77" r="4" fill={colors.glow} />
    <circle cx="75" cy="89" r="4" fill={colors.glow} />
  </svg>
);

export const BrokerGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <polygon points="60,20 100,40 60,60 20,40" fill={colors.top} />
    <polygon points="20,40 60,60 60,100 20,80" fill={colors.left} />
    <polygon points="60,60 100,40 100,80 60,100" fill={colors.right} />
    {/* Large Left-Face Queue Cutout */}
    <polygon points="26,50 54,64 54,88 26,74" fill={colors.dark} />
    {/* Buffered Packets inside the queue */}
    <polygon points="32,66 42,71 42,75 32,70" fill={colors.glow} />
    <polygon points="40,71 50,76 50,80 40,75" fill={colors.top} />
    <polygon points="48,76 54,79 54,83 48,80" fill={colors.glow} />
  </svg>
);

export const AuthGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <polygon points="60,20 100,40 60,60 20,40" fill={colors.top} />
    <polygon points="20,40 60,60 60,100 20,80" fill={colors.left} />
    <polygon points="60,60 100,40 100,80 60,100" fill={colors.right} />
    {/* 3D Isometric Key on Left Face */}
    <g transform="translate(0, 3)">
      <ellipse cx="38" cy="58" rx="6" ry="10" fill="none" stroke={colors.glow} strokeWidth="3" transform="rotate(-26 38 58)" />
      <line x1="43" y1="63" x2="55" y2="69" stroke={colors.glow} strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="67" x2="50" y2="72" stroke={colors.glow} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="54" y1="69" x2="54" y2="74" stroke={colors.glow} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);