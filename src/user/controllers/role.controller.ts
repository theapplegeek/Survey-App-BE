import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../auth/models/role.enum';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { RoleDto } from '../dtos/role.dto';

@Controller('role')
@Roles(Role.Admin)
@ApiTags('Role')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiProperty({ description: 'Get all roles' })
  @ApiOkResponse({
    description: 'Return all roles',
    type: RoleDto,
    isArray: true,
  })
  async findAll() {
    return this.roleService.findAll();
  }
}
