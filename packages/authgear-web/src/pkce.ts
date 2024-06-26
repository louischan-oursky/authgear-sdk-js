/* global Uint8Array, window */

import { _encodeUTF8, _base64URLEncode } from "@authgear/core";

// windowCryptoSubtleDigest is window.crypto.subtle.digest with IE 11 support.
async function windowCryptoSubtleDigest(
  algorithm: string,
  data: Uint8Array
): Promise<Uint8Array> {
  const promiseOrEvent = window.crypto.subtle.digest(algorithm, data.buffer);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (promiseOrEvent.then) {
    return promiseOrEvent.then((output: ArrayBuffer) => {
      return new Uint8Array(output);
    });
  }
  return new Promise((resolve, reject) => {
    (promiseOrEvent as any).oncomplete = function (output: ArrayBuffer) {
      resolve(new Uint8Array(output));
    };
    (promiseOrEvent as any).onerror = function (err: any) {
      reject(err);
    };
  });
}

async function sha256(s: string): Promise<Uint8Array> {
  const bytes = _encodeUTF8(s);
  return windowCryptoSubtleDigest("SHA-256", bytes);
}

export async function computeCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const hash = await sha256(codeVerifier);
  const base64 = _base64URLEncode(hash);
  return base64;
}

export function generateCodeVerifier(): string {
  const arr = new Uint8Array(32);
  window.crypto.getRandomValues(arr);
  const base64 = _base64URLEncode(arr);
  return base64;
}
