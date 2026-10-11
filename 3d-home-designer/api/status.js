export const config = { runtime: "edge" };
export default async function handler(req) {
  if (req.method !== "GET")
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  return Response.json(
    {
      configured: Boolean(process.env.OPENAI_API_KEY),
      billing: "server",
      productImageTo3D: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
