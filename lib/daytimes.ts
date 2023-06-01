import SunCalc from "suncalc";

enum DayTime {
  Night = 1,
  Dawn = 2,
  Day = 3,
}

async function fetchIpInfo(): Promise<any | null> {
  try {
    const response = await fetch("http://ip-api.com/json");
    if (response.ok) {
      return response.json();
    } else {
      console.error("Request failed with status " + response.status);
    }
  } catch (error) {
    console.error("Request failed with status: ", error);
    return null;
  }
}

export async function getSunTimes(): Promise<SunCalc.GetTimesResult> {
  const ipInfo = await fetchIpInfo();
  return SunCalc.getTimes(new Date(), ipInfo["lat"], ipInfo["lon"]);
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

  if (currentDate <= sunTimes["nightEnd"]) {
    return DayTime.Night;
  } else if (
    currentDate > sunTimes["nightEnd"] &&
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
    currentDate <= sunTimes["night"]
  ) {
    return DayTime.Dawn;
  } else if (currentDate > sunTimes["night"]) {
    return DayTime.Night;
  }
  return DayTime.Day;
}
