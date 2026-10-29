/**
 * Encrypts the weekly export so the GitHub download is useless without Jamie's passphrase.
 * Format: "JBX1" | salt(16) | iv(12) | tag(16) | ciphertext. Key = scrypt(passphrase, salt). AES-256-GCM.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const MAGIC = Buffer.from("JBX1");
const key = (passphrase, salt) => scryptSync(passphrase, salt, 32, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

export function encrypt(plain, passphrase) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(passphrase, salt), iv);
  const body = Buffer.concat([c.update(plain), c.final()]);
  return Buffer.concat([MAGIC, salt, iv, c.getAuthTag(), body]);
}

export function decrypt(blob, passphrase) {
  if (!blob.subarray(0, 4).equals(MAGIC)) throw new Error("Not a jamieho-backroom export file.");
  const salt = blob.subarray(4, 20);
  const iv = blob.subarray(20, 32);
  const tag = blob.subarray(32, 48);
  const d = createDecipheriv("aes-256-gcm", key(passphrase, salt), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(blob.subarray(48)), d.final()]);
}
