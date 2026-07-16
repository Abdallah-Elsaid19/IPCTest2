export type ContentPageSlug = "about" | "awards" | "clubs" | "events" | "scholarships" | "sponsorship";

const EVENT_NAME = "ipc:content-updated";
const STORAGE_KEY = "ipc:content-update";
const CHANNEL_NAME = "ipc-content-sync";

interface ContentUpdateMessage {
  slug: ContentPageSlug;
  timestamp: number;
}

export function publishContentUpdate(slug: ContentPageSlug) {
  const message: ContentUpdateMessage = { slug, timestamp: Date.now() };
  window.dispatchEvent(new CustomEvent<ContentUpdateMessage>(EVENT_NAME, { detail: message }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Storage may be disabled; the in-page event and BroadcastChannel still work.
  }
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(message);
    channel.close();
  }
}

export function subscribeToContentUpdates(slug: ContentPageSlug, refresh: () => void) {
  let lastRefresh = 0;
  const runRefresh = () => {
    const now = Date.now();
    if (now - lastRefresh < 250) return;
    lastRefresh = now;
    refresh();
  };
  const matches = (message: unknown) => Boolean(
    message && typeof message === "object" && (message as ContentUpdateMessage).slug === slug,
  );
  const handleCustomEvent = (event: Event) => {
    if (matches((event as CustomEvent<ContentUpdateMessage>).detail)) runRefresh();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      if (matches(JSON.parse(event.newValue))) runRefresh();
    } catch {
      // Ignore malformed external storage values.
    }
  };
  const handleVisibility = () => {
    if (document.visibilityState === "visible") runRefresh();
  };
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
  if (channel) channel.onmessage = (event) => { if (matches(event.data)) runRefresh(); };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorage);
  window.addEventListener("focus", runRefresh);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    channel?.close();
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("focus", runRefresh);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
