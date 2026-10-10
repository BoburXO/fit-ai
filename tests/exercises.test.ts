import { describe, expect, it } from "vitest";
import { createPlankCounter } from "../lib/exercises/plank";
import { createPushupCounter } from "../lib/exercises/pushup";
import { createSquatCounter } from "../lib/exercises/squat";
import { blank, plankPose, pushupPose, squatPose } from "./helpers";

/** Feed a sequence of angles at 30 fps, returning the last frame result. */
function run(counter: ReturnType<typeof createSquatCounter>, angles: number[], make: (a: number) => ReturnType<typeof squatPose>, t0 = 0) {
  let t = t0;
  let last = counter.update(null, t);
  for (const a of angles) {
    t += 33;
    last = counter.update(make(a), t);
  }
  return { last, t };
}

const ramp = (from: number, to: number, steps: number) =>
  Array.from({ length: steps }, (_, i) => from + ((to - from) * (i + 1)) / steps);

const squatCycle = [...ramp(175, 80, 14), ...ramp(80, 175, 14)];

describe("squat counter", () => {
  it("counts one rep per full cycle", () => {
    const c = createSquatCounter();
    const { last } = run(c, [175, 175, ...squatCycle, ...squatCycle, ...squatCycle], squatPose);
    expect(last.reps).toBe(3);
    expect(last.phase).toBe("standing");
  });

  it("does not count a shallow squat", () => {
    const c = createSquatCounter();
    const { last } = run(c, [175, 175, ...ramp(175, 130, 10), ...ramp(130, 175, 10)], squatPose);
    expect(last.reps).toBe(0);
  });

  it("does not double count jitter around the bottom", () => {
    const c = createSquatCounter();
    const jitter = [90, 95, 88, 98, 92, 100, 90, 96];
    const { last } = run(c, [175, 175, ...ramp(175, 90, 10), ...jitter, ...ramp(90, 175, 12)], squatPose);
    expect(last.reps).toBe(1);
  });

  it("rejects implausibly fast cycles", () => {
    const c = createSquatCounter({ smoothing: 1 });
    // 4 frames down + 4 frames up at 33ms is about 260ms, below minRepMs.
    const { last } = run(c, [175, 175, 80, 80, 175, 175], squatPose);
    expect(last.reps).toBe(0);
  });

  it("ignores frames with missing landmarks", () => {
    const c = createSquatCounter();
    const { last } = run(c, [175, 175], squatPose);
    const res = c.update(null, 5000);
    expect(res.visible).toBe(false);
    expect(res.feedback).toBe("not_visible");
    expect(res.reps).toBe(last.reps);
    expect(c.update(blank(), 5033).visible).toBe(false);
  });

  it("resets the cycle after a long landmark loss", () => {
    const c = createSquatCounter();
    run(c, [175, 175, ...ramp(175, 80, 14)], squatPose);
    c.update(null, 10_000);
    const res = c.update(null, 12_000);
    expect(res.phase).toBe("idle");
    expect(res.reps).toBe(0);
  });
});

describe("push-up counter", () => {
  const cycle = [...ramp(170, 70, 12), ...ramp(70, 170, 12)];
  const make = (a: number) => pushupPose(a);

  it("counts a down-and-up cycle", () => {
    const c = createPushupCounter();
    const { last } = run(c, [170, 170, ...cycle, ...cycle], make);
    expect(last.reps).toBe(2);
  });

  it("does not count half reps", () => {
    const c = createPushupCounter();
    const { last } = run(c, [170, 170, ...ramp(170, 120, 8), ...ramp(120, 170, 8)], make);
    expect(last.reps).toBe(0);
  });

  it("does not count when the body is upright (not in push-up position)", () => {
    const c = createPushupCounter();
    const { last } = run(c, [170, 170, ...cycle], (a) => pushupPose(a, { tilted: true }));
    expect(last.reps).toBe(0);
    expect(last.feedback).toBe("get_in_position");
  });
});

describe("plank timer", () => {
  it("accumulates time while aligned", () => {
    const c = createPlankCounter();
    let t = 0;
    let r = c.update(plankPose(178), t);
    for (let i = 0; i < 60; i++) {
      t += 33;
      r = c.update(plankPose(178), t);
    }
    expect(r.phase).toBe("holding");
    expect(r.holdSec).toBeGreaterThan(1.9);
    expect(r.holdSec).toBeLessThan(2.1);
  });

  it("pauses while hips sag or landmarks are missing", () => {
    const c = createPlankCounter({ smoothing: 1 });
    let t = 0;
    c.update(plankPose(178), t);
    for (let i = 0; i < 30; i++) c.update(plankPose(178), (t += 33));
    const held = c.update(plankPose(178), (t += 33)).holdSec;
    for (let i = 0; i < 30; i++) c.update(plankPose(135), (t += 33));
    for (let i = 0; i < 10; i++) c.update(null, (t += 33));
    const after = c.update(plankPose(135), (t += 33));
    expect(after.holdSec).toBeCloseTo(held, 5);
    expect(after.feedback).toBe("check_posture");
  });

  it("caps a single large frame gap", () => {
    const c = createPlankCounter();
    c.update(plankPose(178), 0);
    const r = c.update(plankPose(178), 60_000);
    expect(r.holdSec).toBeLessThanOrEqual(0.5);
  });
});
