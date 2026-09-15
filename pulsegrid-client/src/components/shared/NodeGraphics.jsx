import React from 'react';

export const GatewayGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 512 512" className={className}>
    <path fill={colors.left} d="M256,480 L88,384 V184 L256,280 Z"/>
    <path fill={colors.right} d="M256,480 V280 L424,184 V384 Z"/>
    <path fill={colors.top} d="M256,280 L88,184 L256,88 L424,184 Z"/>
    <polygon fill={colors.dark} opacity="0.8" points="256,184 88,280 88,320 256,224 424,320 424,280"/>
    <circle fill={colors.glow} cx="224" cy="208" r="10"/>
    <circle fill={colors.glow} cx="224" cy="240" r="10"/>
    <polygon fill={colors.top} opacity="0.6" points="120,310 200,356 200,388 120,342"/>
    <polygon fill={colors.top} opacity="0.6" points="120,374 200,420 200,452 120,406"/>
  </svg>
);

export const DatabaseGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 512 512" className={className}>
    {[344, 256, 168, 80].map((y, i) => (
      <g key={y}>
        <path fill={colors.left} d={`M128,${y} v96 c0,35 57,64 128,64 s128,-29 128,-64 v-96 Z`} />
        {i !== 3 && <path fill={colors.right} d={`M384,${y} v96 c0,35 -57,64 -128,64 S128,${y+96} 128,${y} Z`} opacity="0.4" />}
        <path fill={colors.dark} d={`M216,${y+112} h80 a12,12 0 0,0 0,-24 h-80 a12,12 0 0,0 0,24 Z`} />
      </g>
    ))}
    <ellipse fill={colors.top} cx="256" cy="80" rx="128" ry="64"/>
  </svg>
);

export const ServiceGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 512 512" className={className}>
    {[304, 184, 64].map((y) => (
      <g key={y}>
        <path fill={colors.left} d={`M256,${y+160} L48,${y+40} V${y+80} L256,${y+200} Z`} />
        <path fill={colors.right} d={`M256,${y+200} V${y+160} L464,${y+40} V${y+80} Z`} />
        <path fill={colors.top} d={`M256,${y+160} L48,${y+40} L256,${y-80} L464,${y+40} Z`} />
        <polygon fill={colors.dark} points={`80,${y+75} 180,${y+132} 180,${y+142} 80,${y+85}`} />
        <circle fill={colors.glow} cx="205" cy={y+130} r="6"/>
        <circle fill={colors.glow} cx="225" cy={y+142} r="6"/>
        <circle fill={colors.glow} cx="245" cy={y+154} r="6"/>
      </g>
    ))}
  </svg>
);

export const WorkerGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 512 512" className={className}>
    <path fill={colors.left} d="M256,504 L48,384 V144 L256,264 Z"/>
    <path fill={colors.right} d="M256,504 V264 L464,144 V384 Z"/>
    <path fill={colors.top} d="M256,264 L48,144 L256,24 L464,144 Z"/>
    <polygon fill={colors.dark} opacity="0.6" points="80,260 170,312 170,344 80,292"/>
    <polygon fill={colors.dark} opacity="0.6" points="80,330 170,382 170,414 80,362"/>
    <polygon fill={colors.dark} opacity="0.6" points="80,400 170,452 170,484 80,432"/>
    <circle fill={colors.glow} cx="216" cy="304" r="16"/>
    <circle fill={colors.glow} cx="216" cy="374" r="16"/>
    <circle fill={colors.glow} cx="216" cy="444" r="16"/>
  </svg>
);

export const BrokerGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 512 512" className={className}>
    {/* Inner Walls */}
    <path fill={colors.right} opacity="0.5" d="M256,264 L48,144 V384 L256,504 Z"/>
    <path fill={colors.left} opacity="0.5" d="M256,264 L464,144 V384 L256,504 Z"/>
    
    {/* Internal Queue Cards */}
    {[110, 160, 210].map((offset, i) => (
      <path key={i} fill={colors.top} stroke={colors.dark} strokeWidth="4" 
            d={`M${256 + offset},${384 - (offset*0.577)} L${48 + offset},${264 - (offset*0.577)} V${144 - (offset*0.577)} L${256 + offset},${264 - (offset*0.577)} Z`} />
    ))}
    
    {/* Front Left Wall with Cutout */}
    <path fill={colors.left} d="M256,504 L48,384 V144 L256,264 Z M224,466 V264 L80,180 V382 Z" fillRule="evenodd"/>
    {/* Front Right Wall */}
    <path fill={colors.right} d="M256,504 V264 L464,144 V384 Z"/>
    
    {/* Protruding I/O Panel */}
    <path fill={colors.left} d="M288,380 L400,315 V405 L288,470 Z"/>
    <path fill={colors.top} d="M288,380 L310,367 L422,302 L400,315 Z"/>
    <path fill={colors.dark} d="M400,315 L422,302 V392 L400,405 Z"/>
    <line x1="315" y1="395" x2="375" y2="360" stroke={colors.glow} strokeWidth="10" strokeLinecap="round"/>
    <line x1="315" y1="425" x2="375" y2="390" stroke={colors.glow} strokeWidth="10" strokeLinecap="round"/>
  </svg>
);

export const AuthGraphic = ({ colors, className }) => (
  <svg viewBox="0 0 512 512" className={className}>
    {[360, 240, 120].map((y, i) => (
      <g key={i}>
         <path fill={colors.top} d={`M256,${y-96} L48,${y+24} L256,${y+144} L464,${y+24} Z M256,${y-48} L416,${y+44} L256,${y+136} L96,${y+44} Z`} fillRule="evenodd"/>
         <path fill={colors.left} d={`M48,${y+24} V${y+64} L256,${y+184} V${y+144} Z`} />
         <path fill={colors.right} d={`M464,${y+24} V${y+64} L256,${y+184} V${y+144} Z`} />
         <path fill={colors.dark} d={`M256,${y+136} L96,${y+44} L256,${y-48} L416,${y+44} Z`} opacity="0.6"/>
      </g>
    ))}
    {/* Floating Security Core */}
    <path fill={colors.dark} d="M256,140 L160,85 L256,30 L352,85 Z"/>
    <path fill={colors.left} d="M160,85 V115 L256,170 V140 Z"/>
    <path fill={colors.right} d="M352,85 V115 L256,170 V140 Z"/>
    {/* Isometric Key */}
    <g transform="translate(256, 100)">
       <ellipse cx="-30" cy="-10" rx="15" ry="25" fill="none" stroke={colors.glow} strokeWidth="8" transform="rotate(-60 -30 -10)"/>
       <line x1="-12" y1="0" x2="30" y2="25" stroke={colors.glow} strokeWidth="8" strokeLinecap="round" />
       <line x1="10" y1="13" x2="10" y2="35" stroke={colors.glow} strokeWidth="8" strokeLinecap="round" />
       <line x1="25" y1="22" x2="25" y2="44" stroke={colors.glow} strokeWidth="8" strokeLinecap="round" />
    </g>
    {/* Encryption Connectors */}
    <path fill="none" stroke={colors.glow} strokeWidth="10" strokeLinejoin="round" d="M130,120 V250 L60,290 V430 L256,540 L452,430 V290 L382,250 V120"/>
  </svg>
);