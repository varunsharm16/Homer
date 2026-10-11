import {
  Trash2,
  X,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
} from "lucide-react";
import { useEditor } from "../lib/editorStore";
const colors = [
  "#eee6d8",
  "#d2bda0",
  "#a98463",
  "#85664f",
  "#57624d",
  "#d2d1c9",
];
export default function Inspector({ floor, selected }) {
  const update = useEditor((s) => s.updateObject),
    material = useEditor((s) => s.material),
    remove = useEditor((s) => s.deleteObject),
    select = useEditor((s) => s.select);
  const object = floor.objects.find((o) => o.id === selected);
  const surface = [...floor.walls, ...floor.rooms].find(
    (s) => s.id === selected,
  );
  if (!object && !surface)
    return (
      <div className="empty-selection">
        <span>Make it yours.</span>
        <p>
          Select a wall, floor, or piece of furniture in your home to edit its
          details.
        </p>
      </div>
    );
  const color = object?.color || floor.materials[selected]?.color || "#e8dfcf";
  const num = (label, value, onChange, min, max) => (
    <label className="number-field">
      <span>{label}</span>
      <input
        type="number"
        step="0.1"
        min={min}
        max={max}
        value={+value.toFixed(2)}
        onChange={(e) => {
          if (e.target.value === "") return;
          const v = Number(e.target.value);
          if (
            Number.isFinite(v) &&
            (min === undefined || v >= min) &&
            (max === undefined || v <= max)
          )
            onChange(v);
        }}
      />
    </label>
  );
  const setVector = (key, index, value) => {
    const vector = [...object[key]];
    vector[index] = value;
    update(object.id, { [key]: vector });
  };
  const wall = floor.walls.find((w) => w.id === object?.wallId);
  const center = (axis) => {
    if (!wall) return;
    const p = [...object.position];
    if (axis === "horizontal") {
      p[0] = (wall.from[0] + wall.to[0]) / 2;
      p[2] = (wall.from[1] + wall.to[1]) / 2;
      const angle = Math.atan2(
        wall.to[1] - wall.from[1],
        wall.to[0] - wall.from[0],
      );
      p[0] += -Math.sin(angle) * 0.12;
      p[2] += Math.cos(angle) * 0.12;
    } else {
      const centerY = { art: 0, cabinet: 0.45, bookshelf: 1 }[object.type] || 0;
      p[1] = wall.height / 2 - centerY * object.scale[1];
    }
    update(object.id, { position: p });
  };
  return (
    <div className="inspector">
      <div className="inspector-title">
        <div>
          <p className="eyebrow">{object ? "OBJECT" : "SURFACE"}</p>
          <h3>{object?.name || surface.name}</h3>
        </div>
        <button
          className="icon-button"
          aria-label="Clear selection"
          onClick={() => select(null)}
        >
          <X size={16} />
        </button>
      </div>
      {object?.reference && (
        <img
          className="reference-preview"
          src={object.reference}
          alt="Saved product reference"
        />
      )}
      {object?.source && (
        <a
          className="text-link"
          href={object.source}
          target="_blank"
          rel="noreferrer"
        >
          View product source ↗
        </a>
      )}
      <div className="inspector-section">
        <label className="section-label">Color</label>
        <div className="swatches">
          {colors.map((c) => (
            <button
              key={c}
              style={{ background: c }}
              className={color === c ? "chosen" : ""}
              aria-label={`Set color ${c}`}
              onClick={() =>
                object
                  ? update(object.id, { color: c })
                  : material(selected, { color: c })
              }
            />
          ))}
          <input
            aria-label="Custom color"
            type="color"
            value={color}
            onChange={(e) =>
              object
                ? update(object.id, { color: e.target.value })
                : material(selected, { color: e.target.value })
            }
          />
        </div>
      </div>
      {!object && (
        <div className="inspector-section">
          <label className="section-label" htmlFor="finish">
            Material & texture
          </label>
          <select
            id="finish"
            value={floor.materials[selected]?.type || "plaster"}
            onChange={(e) => material(selected, { type: e.target.value })}
          >
            {["paint", "wood", "tile", "plaster", "fabric"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <p className="field-note">
            Procedural textures. Colors and finishes are editable.
          </p>
        </div>
      )}
      {object && (
        <>
          <div className="inspector-section">
            <label className="section-label">Position · meters</label>
            <div className="number-grid">
              {["X", "Y", "Z"].map((a, i) => (
                <div key={a}>
                  {num(
                    a,
                    object.position[i],
                    (v) => setVector("position", i, v),
                    -100,
                    100,
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="inspector-section">
            <label className="section-label">Rotation</label>
            {num(
              "Degrees",
              object.rotation,
              (v) => update(object.id, { rotation: v }),
              -360,
              360,
            )}
          </div>
          <div className="inspector-section">
            <label className="section-label">Scale · multiplier</label>
            <div className="number-grid">
              {["Width", "Height", "Depth"].map((a, i) => (
                <div key={a}>
                  {num(
                    a,
                    object.scale[i],
                    (v) => setVector("scale", i, v),
                    0.1,
                    10,
                  )}
                </div>
              ))}
            </div>
          </div>
          {["art", "cabinet", "bookshelf"].includes(object.type) && (
            <div className="inspector-section">
              <label className="section-label" htmlFor="mount-wall">
                Mount to wall
              </label>
              <select
                id="mount-wall"
                value={object.wallId || ""}
                onChange={(e) => {
                  const w = floor.walls.find((w) => w.id === e.target.value);
                  if (w)
                    update(object.id, {
                      wallId: w.id,
                      rotation:
                        (-Math.atan2(w.to[1] - w.from[1], w.to[0] - w.from[0]) *
                          180) /
                        Math.PI,
                    });
                }}
              >
                <option value="">Choose a wall</option>
                {floor.walls.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <button
                className="secondary full"
                disabled={!wall}
                onClick={() => center("horizontal")}
              >
                <AlignHorizontalJustifyCenter size={15} /> Center horizontally
              </button>
              <button
                className="secondary full"
                disabled={!wall}
                onClick={() => center("vertical")}
              >
                <AlignVerticalJustifyCenter size={15} /> Center vertically
              </button>
            </div>
          )}
          <button className="delete-object" onClick={() => remove(object.id)}>
            <Trash2 size={15} /> Remove object
          </button>
          <p className="field-note">
            Library objects are editable approximations, not exact retailer
            models.
          </p>
        </>
      )}
    </div>
  );
}
