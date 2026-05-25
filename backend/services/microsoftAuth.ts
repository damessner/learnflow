import jwt from 'jsonwebtoken'

interface JwtPayload {
  sub: string
  name: string
  email: string
  oid: string
  tid: string
  iss?: string
  aud?: string
  iat: number
  exp: number
}

interface MsGraphUser {
  id: string
  displayName: string
  mail: string
  userPrincipalName: string
}

export async function verifyMsToken(token: string): Promise<JwtPayload | null> {
  if (process.env.NODE_ENV === 'development' || !process.env.MS_CLIENT_ID) {
    try {
      const decoded = jwt.decode(token) as JwtPayload
      if (decoded && decoded.sub) return decoded
    } catch {
      /* */
    }
    return null
  }

  try {
    const decoded = jwt.decode(token) as JwtPayload
    if (!decoded || !decoded.iss?.includes('login.microsoftonline.com')) return null
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null
    if (decoded.aud !== process.env.MS_CLIENT_ID) return null
    return decoded
  } catch {
    return null
  }
}

export async function getMsGraphUser(accessToken: string): Promise<MsGraphUser | null> {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) return null
    return (await response.json()) as MsGraphUser
  } catch {
    return null
  }
}
