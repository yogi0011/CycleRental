export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  location?: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
  role: string;
};
