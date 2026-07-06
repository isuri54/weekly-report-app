import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  color?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: '#3b82f6' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProject>('Project', ProjectSchema);