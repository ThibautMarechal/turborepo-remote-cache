export interface Team {
  id: string;
  slug: string;
  name: string;
  created: string;
  createdAt: number;
  membership: {
    role: string;
  };
}
