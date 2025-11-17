export type Role = 'INDUSTRY' | 'TRANSPORTER' | 'LOGISTICIAN' | 'SUPPLIER' | 'RECIPIENT' | 'FORWARDER' | 'ADMIN';

export interface JwtClaims {
  sub: string;
  roles: Role[];
  orgId: string;
  locale?: string;
}

export function hasRole(claims: JwtClaims, role: Role): boolean {
  return claims.roles.includes(role);
}
