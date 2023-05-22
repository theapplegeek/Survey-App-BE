export class JwtPayloadDto {
  constructor(username: string, sub: string) {
    this.username = username;
    this.sub = sub;
  }

  username: string;
  sub: string;
}
