import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workoutLogs = sqliteTable("workout_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  completedAt: text("completed_at").notNull(),
  totalTime: integer("total_time").notNull(),
  exercisesCompleted: integer("exercises_completed").notNull(),
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({ id: true });
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
