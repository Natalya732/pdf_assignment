export function getUserTimezone(): string {
  return Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone;
}

export function getAmPmTimeFromUTC(
  utcTimeStamp: string | Date | number
): string {
  try {
    if (!utcTimeStamp) return "__";
    const date = new Date(utcTimeStamp);

    const timeString = date.toLocaleTimeString("en-US", {
      timeZone: getUserTimezone(),
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Remove leading zero from hour and ensure single space before AM/PM
    return timeString.replace(/^0/, "");
  } catch (error) {
    console.error("Error getting AM/PM time from UTC:", error);
    return "__";
  }
}
