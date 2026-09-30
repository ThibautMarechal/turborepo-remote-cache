export interface TokenScope {
  type: 'user' | 'team';
  teamId?: string;
  origin: string;
  createdAt: number;
  expiresAt?: number;
}

export interface Token {
  id: string;
  name: string;
  type: string;
  origin: string;
  scopes: TokenScope[];
  activeAt: number;
  createdAt: number;
  expiresAt?: number;
}
