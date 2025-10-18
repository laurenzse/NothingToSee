import { NextResponse } from "next/server";

/**
 * Server-side geolocation API route
 * Bypasses CORS restrictions by fetching from the server
 * Passes client IP to geolocation services for accurate location
 */
export async function GET(request: Request) {
  // Extract client IP from request headers
  // These headers are set by proxies/load balancers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp || null;

  // List of geolocation services to try
  const services = [
    {
      name: "ipapi.co",
      url: clientIp
        ? `https://ipapi.co/${clientIp}/json/`
        : "https://ipapi.co/json/",
      parser: (data: any) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country_name,
      }),
    },
    {
      name: "ip-api.com",
      url: clientIp
        ? `http://ip-api.com/json/${clientIp}`
        : "http://ip-api.com/json/",
      parser: (data: any) => ({
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        country: data.country,
      }),
    },
    {
      name: "ipwhois.app",
      url: clientIp
        ? `http://ipwho.is/${clientIp}`
        : "http://ipwho.is/",
      parser: (data: any) => ({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country,
      }),
    },
  ];

  // Try each service
  for (const service of services) {
    try {
      const response = await fetch(service.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NothingToSee/1.0)",
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const location = service.parser(data);

        // Validate we got coordinates
        if (
          location.latitude &&
          location.longitude &&
          !isNaN(location.latitude) &&
          !isNaN(location.longitude)
        ) {
          return NextResponse.json({
            success: true,
            location,
            service: service.name,
            clientIp: clientIp || "unknown", // For debugging
          });
        }
      }
    } catch (error) {
      // Continue to next service
      continue;
    }
  }

  // All services failed - return fallback
  return NextResponse.json(
    {
      success: false,
      message: "Geolocation services unavailable, using fallback",
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
        city: "London",
        country: "United Kingdom",
      },
      fallback: true,
    },
    { status: 200 } // Still return 200 so client knows fallback is intentional
  );
}
