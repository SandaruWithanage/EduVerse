import { Module } from "@nestjs/common";
import { TimetableController } from "./timetable.controller";
import { TimetableService } from "./timetable.service";
import { TimetableOverridesController } from "./overrides/timetable-overrides.controller";
import { TimetableOverridesService } from "./overrides/timetable-overrides.service";

@Module({
  controllers: [
    TimetableController,
    TimetableOverridesController,
  ],
  providers: [
    TimetableService,
    TimetableOverridesService,
  ],
})
export class TimetableModule {}
