import SunCalc from "suncalc";

enum DayTime {
  Night = 1,
  Dawn = 2,
  Day = 3,
}

async function fetchIpInfo(): Promise<any | null> {
  try {
    // Use our Next.js API route which bypasses CORS restrictions
    const response = await fetch("/api/geolocation", {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();

      // Check if we got coordinates (either from service or fallback)
      if (data.location?.latitude && data.location?.longitude) {
        return {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
      }
    }
  } catch (error) {
    // API route failed
  }

  // If API route fails, return null and use hardcoded fallback
  return null;
}

export async function getSunTimes(): Promise<SunCalc.GetTimesResult> {
  const ipInfo = await fetchIpInfo();

  if (!ipInfo || !ipInfo.latitude || !ipInfo.longitude) {
    // Fallback to default coordinates when geolocation is unavailable
    // Using London as a reasonable default for European timezone
    return SunCalc.getTimes(new Date(), 51.5074, -0.1278);
  }

  return SunCalc.getTimes(new Date(), ipInfo.latitude, ipInfo.longitude);
}

export async function getCurrentDayTime() {
  let sunTimes: SunCalc.GetTimesResult;
  try {
    sunTimes = await getSunTimes();
  } catch (error) {
    console.error("Could not fetch sun times: ", error);
    return DayTime.Day;
  }

  const currentDate = new Date();

  if (currentDate <= sunTimes["dawn"]) {
    return DayTime.Night;
  } else if (
    currentDate > sunTimes["dawn"] &&
    currentDate <= sunTimes["sunriseEnd"]
  ) {
    return DayTime.Dawn;
  } else if (
    currentDate > sunTimes["sunriseEnd"] &&
    currentDate <= sunTimes["goldenHour"]
  ) {
    return DayTime.Day;
  } else if (
    currentDate > sunTimes["goldenHour"] &&
    currentDate <= sunTimes["dusk"]
  ) {
    return DayTime.Dawn;
  } else if (currentDate > sunTimes["dusk"]) {
    return DayTime.Night;
  }
  return DayTime.Day;
}
