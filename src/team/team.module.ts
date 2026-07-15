import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminTeamController } from './admin-team.controller';
import { PublicTeamController } from './public-team.controller';
import { TeamMember, TeamMemberSchema } from './schemas/team-member.schema';
import { TeamService } from './team.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: TeamMember.name, schema: TeamMemberSchema },
    ]),
  ],
  controllers: [AdminTeamController, PublicTeamController],
  providers: [TeamService],
})
export class TeamModule {}
