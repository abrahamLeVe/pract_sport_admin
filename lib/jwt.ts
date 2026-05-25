import jwt from "jsonwebtoken";

// En producción, define estas variables en tu archivo .env
const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "super_secreto_access_key_123";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "super_secreto_refresh_key_456";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

// ⏱️ Access Token: Corta duración (ej: 15 minutos) por seguridad
export function generarAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

// ⏳ Refresh Token: Larga duración (ej: 7 días) para que el celular no pida login a cada rato
export function generarRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verificarAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verificarRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
