import { PartialType } from "@nestjs/mapped-types";
import { CreateTimetableOverrideDto } from "./create-timetable-override.dto";

export class UpdateTimetableOverrideDto extends PartialType(CreateTimetableOverrideDto) {}
