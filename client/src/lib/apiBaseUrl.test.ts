import { afterEach, describe, expect, it, vi } from "vitest";

const setWindowOrigin = (origin: string) => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        origin,
      },
    },
  });
};

const loadModule = async () => import("./apiBaseUrl");

describe("resolveApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    Reflect.deleteProperty(globalThis, "window");
  });

  it("uses same-origin in production when VITE_API_BASE_URL is unset", async () => {
    vi.stubEnv("MODE", "production");
    vi.stubEnv("VITE_API_BASE_URL", "");
    setWindowOrigin("https://homostayapp-production.up.railway.app");

    const { resolveApiBaseUrl } = await loadModule();

    expect(resolveApiBaseUrl()).toBe("https://homostayapp-production.up.railway.app");
  });
});
