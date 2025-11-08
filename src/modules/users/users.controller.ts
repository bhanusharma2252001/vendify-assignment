import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Request() req, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(req.user, createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.usersService.findAll(req.user, page, pageSize);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/me")
  GetCurrentUser(@Request() req) {
    return req.user;
  }
  @UseGuards(JwtAuthGuard)
  @Get("/roles")
  GetRoles() {
    return this.usersService.getRoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(req.user, id);
  }
}
