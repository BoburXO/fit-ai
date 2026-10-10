export type CameraErrorCode = "denied" | "not_found" | "unsupported" | "unknown";

export class CameraError extends Error {
  constructor(public code: CameraErrorCode) {
    super(code);
  }
}

export const CAMERA_MESSAGE_UZ: Record<CameraErrorCode, string> = {
  denied: "Kameraga ruxsat berilmadi. Brauzer manzil qatoridagi qulf belgisi orqali kameraga ruxsat bering va sahifani yangilang.",
  not_found: "Kamera topilmadi. Kamera ulanganini tekshiring.",
  unsupported: "Bu brauzer kamerani qo‘llab-quvvatlamaydi yoki sahifa xavfsiz (HTTPS/localhost) emas.",
  unknown: "Kamerani ochib bo‘lmadi. Boshqa dastur kamerani band qilmaganini tekshiring.",
};

export async function openCamera(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) throw new CameraError("unsupported");
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 540 } },
      audio: false,
    });
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") throw new CameraError("denied");
    if (name === "NotFoundError" || name === "OverconstrainedError") throw new CameraError("not_found");
    throw new CameraError("unknown");
  }
}

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}
