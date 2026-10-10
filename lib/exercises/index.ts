import { createPlankCounter } from "./plank";
import { createPushupCounter } from "./pushup";
import { createSquatCounter } from "./squat";
import type { Counter, ExerciseId } from "./types";

export function createCounter(id: ExerciseId): Counter {
  switch (id) {
    case "squat":
      return createSquatCounter();
    case "pushup":
      return createPushupCounter();
    case "plank":
      return createPlankCounter();
  }
}

export * from "./types";
export { FEEDBACK_UZ } from "./feedback";
