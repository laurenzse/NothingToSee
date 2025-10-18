import SunCalc from "suncalc";

enum DayTime {
  Night = 1,
  Dawn = 2,
  Day = 3,
}

async function fetchIpInfo(): Promise<any | null> {
  // Try multiple geolocation services for reliability
  const services = [
    {
      url: "https://ipapi.co/json/",
      parser: (data: any) => ({ latitude: data.latitude, longitude: data.longitude }),
    },
    {
      url: "https://freeipapi.com/api/json",
      parser: (data: any) => ({ latitude: data.latitude, longitude: data.longitude }),
    },
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const coords = service.parser(data);
        if (coords.latitude && coords.longitude) {
          console.log("Geolocation data received:", coords);
          return coords;
        }
      }
    } catch (error) {
      console.warn(`Geolocation service ${service.url} failed:`, error);
      // Continue to next service
    }
  }

  console.error("All geolocation services failed");
  return null;
}

export async function getSunTimes(): Promise<SunCalc.GetTimesResult> {
  const ipInfo = await fetchIpInfo();

  if (!ipInfo || !ipInfo.latitude || !ipInfo.longitude) {
    // Fallback to default coordinates (e.g., London) if geolocation fails
    console.warn("Could not fetch location, using default coordinates (London)");
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
