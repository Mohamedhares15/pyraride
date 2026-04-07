"use client";

import dynamic from "next/dynamic";

const PyraVoiceAssistant = dynamic(
  () => import("@/components/shared/PyraVoiceAssistant"),
  { ssr: false }
);

export function LazyPyraVoice() {
  return <PyraVoiceAssistant />;
}
