/**
 * Local storage of the user's own voiceover recordings.
 * Audio blobs live in IndexedDB on this device only — nothing is uploaded.
 */

const DB_NAME = "stillpoint-voice";
const STORE = "recordings";
const VERSION = 1;

export const cueKey = (sessionId: string, cueIndex: number) =>
  `${sessionId}:${cueIndex}`;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Recording storage is unavailable in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB failed"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB failed"));
    });
  } finally {
    db.close();
  }
}

export async function saveRecording(key: string, blob: Blob) {
  await withStore("readwrite", (store) => store.put(blob, key) as IDBRequest<IDBValidKey>);
}

export async function getRecording(key: string): Promise<Blob | null> {
  const value = await withStore<Blob | undefined>("readonly", (store) =>
    store.get(key) as IDBRequest<Blob | undefined>,
  );
  return value ?? null;
}

export async function deleteRecording(key: string) {
  await withStore("readwrite", (store) => store.delete(key) as IDBRequest<undefined>);
}

/** Keys of every clip recorded so far, e.g. "morning-stillness:0". */
export async function listRecordedKeys(): Promise<string[]> {
  const keys = await withStore<IDBValidKey[]>("readonly", (store) =>
    store.getAllKeys() as IDBRequest<IDBValidKey[]>,
  );
  return keys.map(String);
}

export async function clearAllRecordings() {
  await withStore("readwrite", (store) => store.clear() as IDBRequest<undefined>);
}

/** Base64 payload for uploading a recording to the app's cloud storage. */
export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < buffer.length; i += chunk) {
    binary += String.fromCharCode(...buffer.subarray(i, i + chunk));
  }
  return btoa(binary);
}
