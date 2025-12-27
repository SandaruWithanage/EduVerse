import { Module } from '@nestjs/common';
import { TeacherLeavesController } from './teacher-leaves.controller';
import { TeacherLeavesService } from './teacher-leaves.service';

@Module({
  controllers: [TeacherLeavesController],
  providers: [TeacherLeavesService],
})
export class TeacherLeavesModule {}
