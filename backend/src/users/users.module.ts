import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { GroupsModule } from '../groups/groups.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GroupsModule,
    RolesModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
