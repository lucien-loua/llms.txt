export async function GET() {
  const apiUrl = process.env.API_URL;
  let apiStatus = "unknown";
  let apiStatusCode = null;

  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/health`, { method: "GET" });
      apiStatus = response.ok ? "up" : "down";
      apiStatusCode = response.status;
    } catch (_) {
      apiStatus = "down";
    }
  }

  return new Response(
    JSON.stringify({
      status: "ok",
      api: apiUrl ? { status: apiStatus, statusCode: apiStatusCode } : undefined,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
