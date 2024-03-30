import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/models/User';
import { UserTokenSchema } from 'src/user/models/UserToken';
import { UserTokenService } from './userToken.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserToken', schema: UserTokenSchema}
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserTokenService]
})
export class UserModule {}
