import { useEffect, useRef, useState } from "react";

export default function FloorRail({
  floors,
  floorId,
  onChange,
  workspaceRef,
  disabled,
}) {
  const active = floors.findIndex((f) => f.id === floorId);
  const [pull, setPull] = useState(0);
  const amount = useRef(0);
  const timeout = useRef();
  const lockedUntil = useRef(0);
  useEffect(() => {
    const el = workspaceRef.current;
    if (!el || disabled) return;
    const wheel = (e) => {
      if (
        e.target.closest("button,input,textarea,select,.prompt-box,.inspector")
      )
        return;
      e.preventDefault();
      if (Date.now() < lockedUntil.current) return;
      const delta =
        e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 350 : 1);
      amount.current += Math.sign(delta) * Math.min(Math.abs(delta), 55);
      const direction = Math.sign(amount.current);
      const next = active + direction;
      setPull(Math.tanh(amount.current / 150) * 52);
      clearTimeout(timeout.current);
      if (
        Math.abs(amount.current) >= 160 &&
        next >= 0 &&
        next < floors.length
      ) {
        lockedUntil.current = Date.now() + 550;
        onChange(floors[next].id);
        amount.current = 0;
        setPull(0);
      } else {
        timeout.current = setTimeout(() => {
          amount.current = 0;
          setPull(0);
        }, 280);
      }
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheel);
      clearTimeout(timeout.current);
      amount.current = 0;
    };
  }, [active, floors, onChange, workspaceRef, disabled]);
  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const align = () =>
      el.style.setProperty(
        "--floor-middle",
        `${window.innerHeight / 2 - el.getBoundingClientRect().top}px`,
      );
    align();
    const observer = new ResizeObserver(align);
    observer.observe(el);
    window.addEventListener("resize", align);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", align);
    };
  }, [workspaceRef]);
  const ticks = [];
  for (let i = -12; i <= (floors.length - 1) * 10 + 12; i++) {
    const isFloor = i >= 0 && i <= (floors.length - 1) * 10 && i % 10 === 0;
    const distance = i - active * 10;
    ticks.push(
      <button
        key={i}
        aria-hidden={!isFloor ? true : undefined}
        tabIndex={isFloor ? 0 : -1}
        disabled={!isFloor || disabled}
        aria-label={isFloor ? `Switch to ${floors[i / 10].name}` : undefined}
        aria-current={distance === 0 ? "step" : undefined}
        className={`rail-tick ${isFloor ? "floor-tick" : ""} ${distance === 0 ? "current" : ""}`}
        style={{
          top: `calc(50% + ${distance * 12 - pull}px)`,
          width: isFloor
            ? distance === 0
              ? 38
              : 26
            : Math.max(8, 25 - Math.abs(distance) * 1.7),
        }}
        onClick={() => {
          setPull(0);
          amount.current = 0;
          onChange(floors[i / 10].id);
        }}
      />,
    );
  }
  return (
    <div className="floor-navigation">
      <span className="rail-label">{String(active + 1).padStart(2, "0")}</span>
      <div className="floor-rail" aria-label="Floor navigation">
        {ticks}
      </div>
      <span className="rail-caption">FLOOR</span>
    </div>
  );
}
