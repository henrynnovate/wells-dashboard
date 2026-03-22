type TelemetryPayload = Record<string, unknown>;

export function trackEvent(event: string, payload: TelemetryPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[telemetry:event]", event, payload);
  }

  const analytics = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (analytics) {
    analytics("event", event, payload);
  }
}

export function trackClientError(scope: string, error: unknown, payload: TelemetryPayload = {}) {
  const message = error instanceof Error ? error.message : "Unknown client error";

  if (process.env.NODE_ENV !== "production") {
    console.error("[telemetry:error]", scope, message, payload);
  }

  trackEvent("client_error", {
    scope,
    message,
    ...payload,
  });
}

export function logServerError(scope: string, error: unknown, payload: TelemetryPayload = {}) {
  const message = error instanceof Error ? error.message : "Unknown server error";
  console.error(`[server-error] ${scope}`, { message, ...payload });
}