import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthProxyService } from './auth-proxy.service';
import { SignupProxyDto } from './dto/signup-proxy.dto';
import { SigninProxyDto } from './dto/signin-proxy.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthProxyController {
  constructor(private readonly authProxy: AuthProxyService) {}

  @Post('signup')
  signup(@Body() dto: SignupProxyDto) {
    return this.authProxy.signup(dto);
  }

  @Post('signin')
  @HttpCode(200)
  signin(@Body() dto: SigninProxyDto) {
    return this.authProxy.signin(dto);
  }
}
