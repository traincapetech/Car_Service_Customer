"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import {
  validateIndianPhone,
  validatePassword,
  getPasswordStrength,
} from "../../lib/validation";

export default function ProfilePage() {
  const { user, updateProfile, changePassword, deactivateAccount } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Profile update state
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Account deactivation state
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateError, setDeactivateError] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const newPasswordStrength = getPasswordStrength(passwordData.newPassword);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!profileData.name || profileData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const phoneErr = validateIndianPhone(profileData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
      });
      toast.success("Profile details updated successfully!");
      setProfileErrors({});
    } catch (err) {
      if (err.fieldErrors) {
        setProfileErrors(err.fieldErrors);
      } else {
        toast.error(err.message || "Failed to update profile details.");
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    const passErr = validatePassword(passwordData.newPassword);
    if (passErr) newErrors.newPassword = passErr;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      toast.success("Password changed successfully! Previous sessions have been secured.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (err) {
      toast.error(err.message || "Unable to change password. Please verify current password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Deactivation
  const handleDeactivate = async (e) => {
    e.preventDefault();
    setDeactivateError("");

    if (!deactivatePassword) {
      setDeactivateError("Current password is required to confirm account deactivation");
      return;
    }

    setIsDeactivating(true);
    try {
      await deactivateAccount(deactivatePassword);
      toast.info("Account deactivated. All active sessions have been terminated.");
      router.push("/login");
    } catch (err) {
      setDeactivateError(err.message || "Incorrect password. Failed to deactivate account.");
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <DashboardSidebar />

            {/* Main Profile Form Area */}
            <div className="flex-1 space-y-8">
              {/* Page Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Profile & Security Settings
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage your personal contact details, security credentials, and garage preferences.
                </p>
              </div>

              {/* CARD 1: PERSONAL INFORMATION */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Details</CardTitle>
                      <CardDescription>
                        Your primary identity and verified contact numbers for service tracking alerts.
                      </CardDescription>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Verified Customer
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => {
                          setProfileData({ ...profileData, name: e.target.value });
                          if (profileErrors.name) setProfileErrors({ ...profileErrors, name: null });
                        }}
                        error={profileErrors.name}
                        leftIcon={User}
                        required
                        disabled={isUpdatingProfile}
                      />

                      <Input
                        label="Registered Mobile"
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => {
                          setProfileData({ ...profileData, phone: e.target.value });
                          if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: null });
                        }}
                        error={profileErrors.phone}
                        leftIcon={Phone}
                        required
                        disabled={isUpdatingProfile}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 tracking-tight">
                        Email Address (Read-only)
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-600 pl-10 pr-10 py-2.5 cursor-not-allowed"
                        />
                        <div className="absolute right-3.5 text-slate-400" title="Email is locked to primary account">
                          <Lock className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Email address is tied to your account security and cannot be changed directly.
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isUpdatingProfile}
                      >
                        Save Profile Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* CARD 2: PASSWORD CHANGE */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password. All previous active refresh sessions will be automatically revoked.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <Input
                      label="Current Password"
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, currentPassword: e.target.value });
                        if (passwordErrors.currentPassword) {
                          setPasswordErrors({ ...passwordErrors, currentPassword: null });
                        }
                      }}
                      error={passwordErrors.currentPassword}
                      leftIcon={KeyRound}
                      required
                      disabled={isUpdatingPassword}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Input
                          label="New Password"
                          id="newPassword"
                          type="password"
                          placeholder="Min. 8 characters"
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, newPassword: e.target.value });
                            if (passwordErrors.newPassword) {
                              setPasswordErrors({ ...passwordErrors, newPassword: null });
                            }
                          }}
                          error={passwordErrors.newPassword}
                          leftIcon={Lock}
                          required
                          disabled={isUpdatingPassword}
                        />
                        {passwordData.newPassword && (
                          <div className="pt-1">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${newPasswordStrength.color}`}
                                style={{ width: `${newPasswordStrength.score}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 text-slate-400">
                              <span>Strength:</span>
                              <span className={`font-semibold ${newPasswordStrength.text}`}>
                                {newPasswordStrength.label}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Input
                        label="Confirm New Password"
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                          if (passwordErrors.confirmPassword) {
                            setPasswordErrors({ ...passwordErrors, confirmPassword: null });
                          }
                        }}
                        error={passwordErrors.confirmPassword}
                        leftIcon={Lock}
                        required
                        disabled={isUpdatingPassword}
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isUpdatingPassword}
                      >
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* CARD 3: DANGER ZONE / ACCOUNT DEACTIVATION */}
              <Card className="border-rose-200">
                <CardHeader className="bg-rose-50/50 rounded-t-2xl border-b border-rose-100">
                  <div className="flex items-center gap-2.5 text-rose-700">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                    <div>
                      <CardTitle className="text-rose-900">Danger Zone</CardTitle>
                      <CardDescription className="text-rose-600">
                        Deactivating your account will immediately suspend access, terminate all active tokens, and cancel ongoing service telemetry.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Deactivate Customer Account</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Once deactivated, you will not be able to log in or book services until an administrator re-enables your account.
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => setDeactivateModalOpen(true)}
                      className="shrink-0"
                    >
                      Deactivate Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* DEACTIVATION MODAL WITH PASSWORD VERIFICATION */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => {
          setDeactivateModalOpen(false);
          setDeactivatePassword("");
          setDeactivateError("");
        }}
        title="Confirm Account Deactivation"
        description="Please confirm your identity by entering your current password. This action will immediately terminate your account access."
      >
        <form onSubmit={handleDeactivate} className="space-y-4">
          {deactivateError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{deactivateError}</span>
            </div>
          )}

          <Input
            label="Current Password"
            id="deactPassword"
            type="password"
            placeholder="••••••••"
            value={deactivatePassword}
            onChange={(e) => {
              setDeactivatePassword(e.target.value);
              if (deactivateError) setDeactivateError("");
            }}
            required
            autoFocus
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setDeactivateModalOpen(false)}
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              type="submit"
              isLoading={isDeactivating}
            >
              Confirm Deactivation
            </Button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}
