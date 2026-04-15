import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IRole } from './Role';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId | IRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ── Never leak password in JSON output ───────────────────────────────────────
UserSchema.set('toJSON', {
  transform(_doc, ret) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ret as any).password = undefined;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
