import { json } from "../_lib/server";

export async function GET() {
  const uptimeSeconds = process.uptime();
  const memoryBytes = process.memoryUsage().rss;

  return json({
    status: "UP",
    uptime: uptimeSeconds,
    memory: memoryBytes,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
