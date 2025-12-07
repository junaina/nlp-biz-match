import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const ALG = "HS256";
export type AuthTokenPayload = {
  sub: string; //userId
  businessId: string; //businessId
};
export async function signAuthToken(payload: AuthTokenPayload) {
  const days = 30;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret);
}
export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as AuthTokenPayload;
}
