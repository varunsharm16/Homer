const finite = (v) =>
  typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 10000;
const point = (p, n = 2) =>
  Array.isArray(p) && p.length === n && p.every(finite);
export async function requestAI(route, body) {
  const response = await fetch(`/api/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json"))
    throw new Error(
      "AI is not connected here. Deploy the server routes and configure an OpenAI API key to use this feature.",
    );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.message ||
        data.error ||
        "The AI service could not complete this request.",
    );
  return data;
}
export function convertPlan(dsl) {
  if (
    !dsl ||
    !Array.isArray(dsl.rooms) ||
    !Array.isArray(dsl.walls) ||
    !dsl.rooms.length ||
    !dsl.walls.length ||
    dsl.rooms.length > 500 ||
    dsl.walls.length > 1000
  )
    throw new Error(
      "The service returned no usable rooms or walls. Your existing floor has been kept.",
    );
  const factor = 0.3048;
  const rooms = dsl.rooms.map((r, i) => {
    if (
      !Array.isArray(r.bounds) ||
      r.bounds.length !== 2 ||
      !r.bounds.every((p) => point(p)) ||
      r.bounds[1][0] <= r.bounds[0][0] ||
      r.bounds[1][1] <= r.bounds[0][1]
    )
      throw new Error("The service returned invalid room measurements.");
    return {
      id: `room-${i}`,
      name: r.name || `Room ${i + 1}`,
      bounds: r.bounds.map((p) => p.map((v) => v * factor)),
    };
  });
  const walls = dsl.walls.map((w, i) => {
    if (
      !point(w.from) ||
      !point(w.to) ||
      !finite(w.height ?? 9) ||
      (w.height ?? 9) <= 0 ||
      !finite(w.thickness ?? 0.5) ||
      (w.thickness ?? 0.5) <= 0 ||
      Math.hypot(w.to[0] - w.from[0], w.to[1] - w.from[1]) < 0.1
    )
      throw new Error("The service returned invalid wall geometry.");
    return {
      id: `wall-${i}`,
      name: `Wall ${i + 1}`,
      from: w.from.map((v) => v * factor),
      to: w.to.map((v) => v * factor),
      height: (w.height || 9) * factor,
      thickness: (w.thickness || 0.5) * factor,
    };
  });
  const points = [
    ...rooms.flatMap((r) => r.bounds),
    ...walls.flatMap((w) => [w.from, w.to]),
  ];
  const minX = Math.min(...points.map((p) => p[0])),
    maxX = Math.max(...points.map((p) => p[0])),
    minZ = Math.min(...points.map((p) => p[1])),
    maxZ = Math.max(...points.map((p) => p[1]));
  const cx = (minX + maxX) / 2,
    cz = (minZ + maxZ) / 2;
  const center = (p) => [p[0] - cx, p[1] - cz];
  return {
    rooms: rooms.map((r) => ({ ...r, bounds: r.bounds.map(center) })),
    walls: walls.map((w) => ({ ...w, from: center(w.from), to: center(w.to) })),
    width: maxX - minX,
    depth: maxZ - minZ,
    objects: [],
    materials: {},
    height: Math.max(...walls.map((w) => w.height)),
  };
}
export function applyAI(operations, floor, availableTypes) {
  if (!Array.isArray(operations) || operations.length > 60)
    throw new Error("The service returned invalid operations.");
  const next = structuredClone(floor);
  for (const op of operations) {
    if (
      op.action === "add_object" &&
      availableTypes.includes(op.type) &&
      point(op.position, 3)
    )
      next.objects.push({
        id: crypto.randomUUID(),
        type: op.type,
        name: op.type.replaceAll("_", " "),
        position: op.position,
        rotation: finite(op.rotation) ? op.rotation : 0,
        scale: [1, 1, 1],
        color: "#baa085",
      });
    else if (
      op.action === "remove_object" &&
      next.objects.some((o) => o.id === op.objectId)
    )
      next.objects = next.objects.filter((o) => o.id !== op.objectId);
    else if (
      op.action === "update_material" &&
      [...next.rooms, ...next.walls].some((s) => s.id === op.surfaceId) &&
      op.material &&
      /^#[0-9a-f]{6}$/i.test(op.material.color || "")
    )
      next.materials[op.surfaceId] = {
        color: op.material.color,
        type: ["paint", "wood", "tile", "plaster", "fabric"].includes(
          op.material.type,
        )
          ? op.material.type
          : "paint",
      };
    else
      throw new Error(
        "The AI proposed an unsupported or invalid edit. No changes were applied.",
      );
  }
  if (!operations.length)
    throw new Error("The service did not propose any edits.");
  return next;
}

export function validateBackup(home, availableTypes) {
  if (
    !home ||
    typeof home.name !== "string" ||
    !home.name.trim() ||
    !Array.isArray(home.floors) ||
    !home.floors.length
  )
    throw new Error("Invalid Homer backup.");
  for (const f of home.floors) {
    if (
      !f ||
      typeof f.name !== "string" ||
      !finite(f.width) ||
      !finite(f.depth) ||
      f.width <= 0 ||
      f.depth <= 0 ||
      !Array.isArray(f.rooms) ||
      !Array.isArray(f.walls) ||
      !Array.isArray(f.objects) ||
      !f.materials ||
      typeof f.materials !== "object" ||
      [...f.rooms, ...f.walls, ...f.objects].length > 2000
    )
      throw new Error("Invalid floor data.");
    const all = [...f.rooms, ...f.walls, ...f.objects];
    if (
      all.some((x) => !x || typeof x.id !== "string") ||
      new Set(all.map((x) => x.id)).size !== all.length
    )
      throw new Error("Invalid or duplicate element IDs.");
    for (const r of f.rooms)
      if (
        !Array.isArray(r.bounds) ||
        r.bounds.length !== 2 ||
        !r.bounds.every((p) => point(p)) ||
        r.bounds[1][0] <= r.bounds[0][0] ||
        r.bounds[1][1] <= r.bounds[0][1]
      )
        throw new Error("Invalid room geometry.");
    for (const w of f.walls)
      if (
        !point(w.from) ||
        !point(w.to) ||
        !finite(w.height) ||
        w.height <= 0 ||
        !finite(w.thickness) ||
        w.thickness <= 0 ||
        Math.hypot(w.to[0] - w.from[0], w.to[1] - w.from[1]) < 0.01
      )
        throw new Error("Invalid wall geometry.");
    for (const o of f.objects) {
      if (
        !availableTypes.includes(o.type) ||
        !point(o.position, 3) ||
        !point(o.scale, 3) ||
        o.scale.some((v) => v <= 0) ||
        !finite(o.rotation) ||
        typeof o.name !== "string" ||
        !/^#[0-9a-f]{6}$/i.test(o.color)
      )
        throw new Error("Invalid object data.");
      if (o.source && !/^https?:\/\//i.test(o.source))
        throw new Error("Invalid product source.");
      if (
        o.reference &&
        !/^data:image\/(png|jpeg|webp);base64,/.test(o.reference)
      )
        throw new Error("Invalid product image.");
    }
    for (const m of Object.values(f.materials))
      if (!m || (m.color && !/^#[0-9a-f]{6}$/i.test(m.color)))
        throw new Error("Invalid material data.");
    if (
      f.plan &&
      (typeof f.plan.name !== "string" ||
        !/^data:image\/(png|jpeg|webp);base64,/.test(f.plan.data))
    )
      throw new Error("Invalid floor plan image.");
  }
  return home;
}
