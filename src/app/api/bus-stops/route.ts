interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("bbox");
  const values = raw?.split(",").map(Number);
  if (
    !values ||
    values.length !== 4 ||
    values.some((n) => !Number.isFinite(n))
  ) {
    return Response.json({ error: "Área inválida." }, { status: 400 });
  }
  const [south, west, north, east] = values;
  if (
    south < -90 ||
    north > 90 ||
    west < -180 ||
    east > 180 ||
    south >= north ||
    west >= east ||
    north - south > 0.15 ||
    east - west > 0.15
  ) {
    return Response.json(
      { error: "Aproxime o mapa para consultar os pontos." },
      { status: 400 },
    );
  }
  const bbox = values.join(",");
  const query = `[out:json][timeout:20];(nwr["highway"="bus_stop"](${bbox});nwr["public_transport"="platform"]["bus"="yes"](${bbox}););out center tags;`;
  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      {
        signal: AbortSignal.timeout(25000),
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) {
      const body = (await response.text()).slice(0, 2000);
      throw new Error(
        `Overpass HTTP ${response.status} ${response.statusText}: ${body}`,
      );
    }
    const data = (await response.json()) as {
      elements: OsmElement[];
      remark?: string;
    };
    if (!Array.isArray(data.elements) || data.remark)
      throw new Error(
        `Resposta incompleta do Overpass: ${data.remark ?? "elements ausente"}`,
      );
    const stops = data.elements.flatMap((element) => {
      const lat = element.lat ?? element.center?.lat;
      const lng = element.lon ?? element.center?.lon;
      if (lat === undefined || lng === undefined) return [];
      return [
        {
          id: `${element.type}/${element.id}`,
          lat,
          lng,
          name: element.tags?.name || "Ponto de ônibus",
          ref: element.tags?.ref || null,
        },
      ];
    });
    return Response.json({ stops });
  } catch (error) {
    console.error("[bus-stops] Falha ao consultar Overpass", { bbox, error });
    const cause = error instanceof Error ? error.cause : undefined;
    const details =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            cause:
              cause instanceof Error
                ? {
                    name: cause.name,
                    message: cause.message,
                    code: (cause as Error & { code?: string }).code,
                  }
                : undefined,
          }
        : { message: String(error) };
    return Response.json(
      {
        error:
          "Não foi possível carregar os pontos de ônibus. Tente novamente.",
        ...(process.env.NODE_ENV === "development" ? { details } : {}),
      },
      { status: 503 },
    );
  }
}
