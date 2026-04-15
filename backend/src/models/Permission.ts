import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  description: string;
  category: 'users' | 'roles' | 'dashboard' | 'settings';
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Permission description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['users', 'roles', 'dashboard', 'settings'],
      required: [true, 'Permission category is required'],
    },
  },
  { timestamps: true }
);

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
