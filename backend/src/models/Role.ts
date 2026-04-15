import mongoose, { Document, Schema } from 'mongoose';
import { IPermission } from './Permission';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: mongoose.Types.ObjectId[] | IPermission[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Role description is required'],
      trim: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
