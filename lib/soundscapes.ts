import { parse } from "@vanillaes/csv";
import { getCurrentDayTime } from "@/lib/daytimes";

async function readFileFromPublicDirectory(
  filePath: string
): Promise<string | null> {
  try {
    const response = await fetch(filePath);
    if (response.ok) {
      const fileContent = await response.text();
      return fileContent;
    } else {
      console.error("Error retrieving file:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving file:", error);
    return null;
  }
}

export async function getSoundscapeLink() {
  const fileContent = await readFileFromPublicDirectory("soundscapes.csv");
  if (!fileContent) {
    throw new Error("Could not read soundscape entries.");
  }
  const soundscapeLines = parse(fileContent) as string[][];

  const dayTime = await getCurrentDayTime();

  const dayTimeSoundscapes = soundscapeLines.filter(
    (row) => parseInt(row[1]) == dayTime
  );
  const randomSoundscape =
    dayTimeSoundscapes[Math.floor(Math.random() * dayTimeSoundscapes.length)];

  return randomSoundscape[0];
}
