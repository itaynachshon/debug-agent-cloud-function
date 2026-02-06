import { Request, Response } from "@google-cloud/functions-framework";

type Event = {
  timestamp: number;
  value: number;
};

async function fetchEvents(limit: number): Promise<Event[]> {
  // Simulated data source
  if (limit <= 0) {
    return [];
  }
  return Array.from({ length: limit }, (_, i) => ({
    timestamp: Date.now() - i * 1000,
    value: i + 1,
  }));
}

export const handler = async (req: Request, res: Response) => {
  const mode = (req.query.mode as string) ?? "basic";
  const limit = Number(req.query.limit ?? 20);
  const offset = Number(req.query.offset ?? 0);

  if (Number.isNaN(limit) || Number.isNaN(offset)) {
    res.status(400).json({ error: "limit and offset must be numbers" });
    return;
  }

  if (limit < 0 || offset < 0) {
    res.status(400).json({ error: "limit and offset must be non-negative" });
    return;
  }

  const events = await fetchEvents(limit + offset);

  if (mode === "basic") {
    return res.json({
      count: events.length,
    });
  }

  // Advanced mode
  const window = events.slice(offset, offset + limit);
  const average =
    window.reduce((sum, e) => sum + e.value, 0) / window.length;

  res.json({
    average,
  });
};
