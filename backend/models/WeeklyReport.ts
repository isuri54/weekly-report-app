import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyReport extends Document {
  user: mongoose.Types.ObjectId;
  weekStartDate: Date;
  project: mongoose.Types.ObjectId;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers?: string;
  hoursWorked?: number;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt?: Date;
  createdAt: Date;
}

const WeeklyReportSchema = new Schema<IWeeklyReport>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  tasksCompleted: { type: String, required: true },
  tasksPlanned: { type: String, required: true },
  blockers: { type: String },
  hoursWorked: { type: Number },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED'], 
    default: 'DRAFT' 
  },
  submittedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWeeklyReport>('WeeklyReport', WeeklyReportSchema);