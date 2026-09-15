import React, { memo } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import useEngineStore from '../../store/useEngineStore';

const TrafficEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const liveEdge = useEngineStore((state) => state.edges[id]);
  const status = liveEdge?.status || 'CONNECTED';
  const cbState = liveEdge?.cbState || 'CLOSED';
  const inTransitCount = liveEdge?.inTransitCount || 0;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isSevered = status === 'SEVERED';
  const isOpen = cbState === 'OPEN';
  const isHalfOpen = cbState === 'HALF_OPEN';

  let strokeColor = '#94A3B8'; // Slate 400
  let particleColor = '#06B6D4'; // Cyan 500

  if (isSevered || isOpen) {
    strokeColor = '#F43F5E'; // Rose 500
  } else if (isHalfOpen) {
    strokeColor = '#F59E0B'; // Amber 500
    particleColor = '#F59E0B';
  }

  return (
    <>
      {/* Underlying Base Path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: isSevered ? 2 : 2.5,
          strokeDasharray: isSevered ? '6 6' : undefined,
          opacity: isSevered ? 0.6 : 0.9,
          transition: 'stroke 0.4s ease',
        }}
      />

      {/* SVG Animated Flowing Particles (Only when link is healthy & active) */}
      {!isSevered && !isOpen && (
        <circle r="3.5" fill={particleColor} className="filter drop-shadow">
          <animateMotion
            dur={isHalfOpen ? '2.4s' : '1.2s'}
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {/* In-Transit Secondary Particle */}
      {!isSevered && !isOpen && inTransitCount > 2 && (
        <circle r="2.5" fill={particleColor} fillOpacity="0.8">
          <animateMotion
            dur={isHalfOpen ? '2.4s' : '1.2s'}
            begin="0.6s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {/* Circuit Breaker / Partition State Badge */}
      <EdgeLabelRenderer>
        {(isOpen || isHalfOpen || isSevered) && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white shadow-md border"
          >
            {isSevered && (
              <span className="text-rose-600 flex items-center gap-0.5">
                ⚡ SEVERED
              </span>
            )}
            {!isSevered && isOpen && (
              <span className="text-rose-600 flex items-center gap-0.5">
                🔒 CB: OPEN
              </span>
            )}
            {!isSevered && isHalfOpen && (
              <span className="text-amber-600 flex items-center gap-0.5 animate-pulse">
                ⚠️ CB: HALF-OPEN
              </span>
            )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(TrafficEdge);