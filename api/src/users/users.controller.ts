import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Ip,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
// Only SUPER_ADMIN and SCHOOL_ADMIN can hit these endpoints
@Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: any,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    return this.usersService.create(dto, user, ip, agent);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    return this.usersService.update(id, dto, user, ip, agent);
  }

  @Patch(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() user: any,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
  ) {
    return this.usersService.resetPassword(id, dto, user, ip, agent);
  }
}
