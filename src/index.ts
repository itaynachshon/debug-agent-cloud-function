import { Request, Response } from "@google-cloud/functions-framework";

type Event = {
  timestamp: number;
  value: number;
};

async function fetchEvents(limit: number): Promise<Event[]> {
  // Simulated data source
  if (limit <= 0) {
    console.log("Fetch events called with non-positive limit, returning empty array.");
    return [];
  }
  console.log(`Fetching events with limit: ${limit}`);
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
    console.error("Received non-numeric limit or offset.", { limit, offset });
    res.status(400).json({ error: "limit and offset must be numbers" });
    return;
  }

  if (limit < 0 || offset < 0) {
    console.error("Received negative limit or offset.", { limit, offset });
    res.status(400).json({ error: "limit and offset must be non-negative" });
    return;
  }

  console.log(`Handling request for mode: ${mode}, limit: ${limit}, offset: ${offset}`);
  const events = await fetchEvents(limit + offset);

  if (mode === "basic") {
    console.log(`Returning basic mode response with count: ${events.length}`);
    return res.json({
      count: events.length,
    });
  }

  // Advanced mode
  const window = events.slice(offset, offset + limit);
  const average =
    window.reduce((sum, e) => sum + e.value, 0) / window.length;

  console.log(`Returning advanced mode response with average: ${average}`);
  res.json({
    average,
  });
};
