declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        handlers?: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

const MIDTRANS_SNAP_URL = "https://app.midtrans.com/snap/snap.js";
const SANDBOX_SNAP_URL = "https://app.sandbox.midtrans.com/snap/snap.js";

export async function loadScript(): Promise<void> {
  if (typeof window === "undefined") return;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION !== "false";
  const src = isProduction ? MIDTRANS_SNAP_URL : SANDBOX_SNAP_URL;

  await new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
    );
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load the payment script."));
    document.body.appendChild(s);
  });

  if (!window.snap) {
    throw new Error("Payment window is unavailable right now.");
  }
}
