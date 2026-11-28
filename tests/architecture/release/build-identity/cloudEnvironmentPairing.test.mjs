import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// Each Desktop channel is paired with exactly one Cloud environment:
// Internal builds exercise the Qubits staging Cloud before promotion, Stable
// builds talk to production. A channel never silently points at the other.
const workflow = (name) =>
  readFileSync(new URL(`../../../../.github/workflows/${name}`, import.meta.url), "utf8");

const endpoints = (source) => ({
  api: [...source.matchAll(/^\s*VITE_DESKTOP_CLOUD_API_URL:\s*(\S+)\s*$/gm)].map((m) => m[1]),
  web: [...source.matchAll(/^\s*VITE_DESKTOP_CLOUD_WEB_URL:\s*(\S+)\s*$/gm)].map((m) => m[1]),
});

describe("Desktop channel to Cloud environment pairing", () => {
  it("builds every Internal platform against the Qubits staging Cloud", () => {
    const internal = endpoints(workflow("desktop-internal-build.yml"));
    expect(internal.api.length).toBeGreaterThan(0);
    expect(new Set(internal.api)).toEqual(new Set(["https://qubits-api.puppyone.ai/api/v1"]));
    expect(new Set(internal.web)).toEqual(new Set(["https://qubits-try.puppyone.ai"]));
    expect(internal.web).toHaveLength(internal.api.length);
  });

  it("builds every Stable platform against the production Cloud", () => {
    const stable = endpoints(workflow("desktop-stable-release.yml"));
    expect(stable.api.length).toBeGreaterThan(0);
    expect(new Set(stable.api)).toEqual(new Set(["https://api.puppyone.ai/api/v1"]));
    expect(new Set(stable.web)).toEqual(new Set(["https://try.puppyone.ai"]));
    expect(stable.web).toHaveLength(stable.api.length);
  });
});
