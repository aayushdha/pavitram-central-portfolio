import { API_BASE_URL } from "../auth/config";
import { getToken } from "../auth/token-storage";
import { ApiRequestError, ApiError } from "../auth/types";

export interface UploadedFile {
  message: string;
  key: string;
  url: string;
}

/**
 * Uploads a single image to this project's own backend, which stores it in
 * MinIO and returns a permanent URL (see `backend/src/storage`). Unlike
 * every other call in `lib/api/`, this one sends `multipart/form-data`
 * instead of JSON, so it doesn't go through the generic `apiClient`.
 */
export async function uploadImage(file: File): Promise<UploadedFile> {
  const token = getToken();
  if (!token) {
    throw new ApiRequestError("You need to be signed in to upload photos.", 401);
  }

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/storage/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new ApiRequestError("Could not reach the server. Check your connection and try again.", 0);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* ignore */
  }

  if (!response.ok) {
    const err = payload as ApiError | null;
    const message = Array.isArray(err?.message) ? err!.message.join(", ") : err?.message ?? `Upload failed (${response.status})`;
    throw new ApiRequestError(message, response.status, err ?? undefined);
  }

  return payload as UploadedFile;
}
