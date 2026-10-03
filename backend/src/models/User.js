import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "mentor", "admin"], default: "student" },
    phone: { type: String, default: "", maxlength: 22 },
    country: { type: String, default: "", maxlength: 60 },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    resetPasswordTokenHash: { type: String, default: "", select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false }
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    country: this.country,
    avatar: this.avatar,
    isEmailVerified: this.isEmailVerified,
    mustChangePassword: this.mustChangePassword,
    createdAt: this.createdAt
  };
};

export const User = mongoose.model("User", userSchema);
