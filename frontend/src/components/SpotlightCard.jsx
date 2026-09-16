import { useRef, useState } from "react";

/**
 * A card that reacts to the mouse: a soft light follows the cursor and the
 * card tilts slightly in 3D toward the pointer. Falls back to a normal
 * static card on touch devices (no mousemove events fire there anyway).
 *
 * `tilt` — set false for a flatter effect (glow only, no rotation).
 * `glowColor` — CSS color used for the radial spotlight.
 */
export default function SpotlightCard({
  children,
  className = "",
  tilt = true,
  glowColor = "99, 102, 241", // brand-500 as an r,g,b triplet
  onClick,
}) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    const rotateY = tilt ? (px - 0.5) * 10 : 0;
    const rotateX = tilt ? (0.5 - py) * 10 : 0;

    setStyle({
      "--spot-x": `${x}px`,
      "--spot-y": `${y}px`,
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
    });
  };

  const handleLeave = () => {
    setHovering(false);
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)",
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={style}
      className={`group relative overflow-hidden transition-transform duration-150 ease-out will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(${glowColor}, 0.14), transparent 70%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
