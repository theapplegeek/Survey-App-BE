import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  constructor(id?: string, name?: string) {
    this.id = id;
    this.name = name;
  }

  @ApiProperty({ description: 'The id of the role' })
  id: string;
  @ApiProperty({ description: 'The name of the role' })
  name: string;
}
