import { useEffect, useState } from "react";
import { getMyVoiceRole } from "@/utils/voice.functions";

/** True when the signed-in account is the creator who may publish voiceovers. */
export function useVoiceOwner() {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getMyVoiceRole()
      .then((result) => {
        if (!cancelled) setIsOwner(result.isOwner);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return isOwner;
}
