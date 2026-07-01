import { useEffect, useState } from "react";
import { getEventById } from "../services/eventService";

export default function useEvent(eventId) {
  const [event, setEvent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    const loadEvent = async () => {
      try {
        setLoading(true);

        const response = await getEventById(eventId);

        // Adjust this if your API returns the event differently
        setEvent(response.data);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  return {
    event,
    loading,
    error,
  };
}
