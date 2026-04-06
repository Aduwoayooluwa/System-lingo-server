import { Controller, Post, Get, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, UpdateProfileDto, UpdatePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, dto);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.sub, dto);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Request() req, @Body('password') password: string) {
    return this.authService.deleteAccount(req.user.sub, password);
  }
}
