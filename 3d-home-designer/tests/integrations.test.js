import test from "node:test";
import assert from "node:assert/strict";
import {
  convertPlan,
  applyAI,
  validateBackup,
  requestAI,
} from "../src/lib/integrations.js";
import parseFloorplan from "../api/parse-floorplan.js";
import sceneCommand from "../api/scene-command.js";

const plan = {
  rooms: [
    {
      bounds: [
        [0, 0],
        [20, 15],
      ],
      name: "Living room",
    },
  ],
  walls: [{ from: [0, 0], to: [20, 0], height: 9, thickness: 0.5 }],
};
const floor = { id: "floor", name: "Ground floor", ...convertPlan(plan) };
test("plan coordinates use meters and a centered origin without mutating the service result", () => {
  const before = structuredClone(plan),
    converted = convertPlan(plan);
  assert.equal(converted.width, 6.096);
  assert.equal(converted.depth, 4.572);
  assert.deepEqual(converted.rooms[0].bounds, [
    [-3.048, -2.286],
    [3.048, 2.286],
  ]);
  assert.ok(Math.abs(converted.walls[0].height - 2.7432) < 1e-9);
  assert.deepEqual(plan, before);
});
test("empty, inverted and nonfinite geometry is rejected instead of generating a successful empty scene", () => {
  assert.throws(() => convertPlan({ rooms: [], walls: [] }), /no usable/);
  assert.throws(
    () =>
      convertPlan({
        ...plan,
        rooms: [
          {
            bounds: [
              [1, 1],
              [0, 0],
            ],
          },
        ],
      }),
    /measurements/,
  );
  assert.throws(
    () =>
      convertPlan({
        ...plan,
        walls: [{ from: [0, 0], to: [10, 0], height: -5 }],
      }),
    /wall geometry/,
  );
  assert.throws(
    () =>
      convertPlan({
        ...plan,
        walls: [{ from: [0, 0], to: [10, 0], thickness: "thin" }],
      }),
    /wall geometry/,
  );
});
test("an invalid edit after a valid one leaves the original scene unchanged", () => {
  const before = structuredClone(floor);
  assert.throws(
    () =>
      applyAI(
        [
          { action: "add_object", type: "sofa", position: [0, 0, 0] },
          { action: "unsupported" },
        ],
        floor,
        ["sofa"],
      ),
    /No changes/,
  );
  assert.deepEqual(floor, before);
  const next = applyAI(
    [{ action: "add_object", type: "sofa", position: [0, 0, 0] }],
    floor,
    ["sofa"],
  );
  assert.equal(next.objects.length, 1);
  assert.equal(floor.objects.length, 0);
  assert.throws(() => applyAI([], floor, ["sofa"]), /did not propose/);
});
test("backup validation rejects malformed geometry, object transforms and unsafe links", () => {
  const home = { name: "A home", floors: [structuredClone(floor)] };
  assert.equal(validateBackup(home, ["sofa"]), home);
  assert.throws(
    () =>
      validateBackup({ name: "Broken", floors: [{ ...floor, walls: [{}] }] }, [
        "sofa",
      ]),
    /Invalid/,
  );
  const object = {
    id: "sofa",
    name: "Sofa",
    type: "sofa",
    position: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: 0,
    color: "#ffffff",
    source: "javascript:alert(1)",
  };
  assert.throws(
    () =>
      validateBackup(
        { name: "Broken", floors: [{ ...floor, objects: [object] }] },
        ["sofa"],
      ),
    /source/,
  );
  assert.throws(
    () =>
      validateBackup(
        {
          name: "Broken",
          floors: [
            {
              ...floor,
              objects: [{ ...object, source: null, scale: [0, 1, 1] }],
            },
          ],
        },
        ["sofa"],
      ),
    /object data/,
  );
});
test("a static host returning HTML cannot be mistaken for a successful AI response", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("<html>app</html>", {
      headers: { "Content-Type": "text/html" },
    });
  try {
    await assert.rejects(requestAI("scene-command", {}), /AI is not connected/);
  } finally {
    globalThis.fetch = original;
  }
});
test("AI routes import and return an explicit unavailable status without server credentials", async () => {
  const original = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    for (const handler of [parseFloorplan, sceneCommand]) {
      const r = await handler(
        new Request("http://localhost/api", {
          method: "POST",
          body: "{}",
          headers: { "Content-Type": "application/json" },
        }),
      );
      assert.equal(r.status, 503);
      assert.match((await r.json()).message, /not connected/);
    }
  } finally {
    if (original) process.env.OPENAI_API_KEY = original;
  }
});
