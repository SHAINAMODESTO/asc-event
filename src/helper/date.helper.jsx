import { format } from "date-fns";

export function formattedDateTime(date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formattedDate(date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export const formatEventDate = (date) =>
  format(new Date(date), "MMMM dd, yyyy");

export const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
