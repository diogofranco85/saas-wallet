import { BinaryToTextEncoding, createHmac, createVerify } from "crypto";

export function validateHmac(openpixSignatureHeader: string, body: string, key: string): boolean {
  const signature = hmacCalculateSignature(key, JSON.stringify(body), 'base64');
  if (signature === openpixSignatureHeader) {
    return true
  }
  return false;
}

export function validateHmacSha256(openpixSignatureHeader: string, body: string, secret: string): boolean {

  const payload = JSON.stringify(body);
  const publicKey = Buffer.from(secret, 'base64').toString('ascii');
  const verify = createVerify('SHA256');
  verify.write(Buffer.from(payload))
  verify.end();

  const isValid = verify.verify(publicKey, openpixSignatureHeader, 'base64');

  if (isValid) {
    true
  }

  return false;
}

const hmacCalculateSignature = (
  key: string,
  body: any,
  encoding: BinaryToTextEncoding = 'base64',
) => createHmac('sha1', key).update(body).digest(encoding);

