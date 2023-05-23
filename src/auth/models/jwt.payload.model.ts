export class JwtPayload {
  constructor(username: string, sub: string, role: string) {
    this.username = username;
    this.sub = sub;
    this.role = role;
  }

  username: string;
  sub: string;
  role: string;
}
