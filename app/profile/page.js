"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Alert from "../../components/ui/Alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import {
  User,
  Phone,
  Mail,
  KeyRound,
  AlertTriangle,
  Lock,
} from "lucide-react";
import {
  validateIndianPhone,
  validatePassword,
} from "../../lib/validation";

function PersonalDetailsCard({ user, updateProfile, toast }) {
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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

  return (
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
            Active
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
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 pl-10 pr-10 py-2.5 cursor-not-allowed"
              />
              <div className="absolute right-3.5 text-slate-400" title="Email is locked to primary account">
                <Lock className="w-4 h-4" aria-hidden="true" />
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
  );
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword, deactivateAccount } = useAuth();
  const toast = useToast();
  const router = useRouter();

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
    <CustomerShell>
      <PageHeader
        title="Profile & Security Settings"
        description="Manage your personal contact details, security credentials, and account status."
        badge={
          <Badge variant="blue" size="sm" dot>
            Verified Customer
          </Badge>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile & Security" },
        ]}
      />

      {/* CARD 1: PERSONAL INFORMATION */}
      <PersonalDetailsCard
        key={user?.id || "initial"}
        user={user}
        updateProfile={updateProfile}
        toast={toast}
      />

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
            <PasswordInput
              label="Current Password"
              id="currentPassword"
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
              autoComplete="current-password"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordInput
                label="New Password"
                id="newPassword"
                placeholder="Min. 8 characters"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  if (passwordErrors.newPassword) {
                    setPasswordErrors({ ...passwordErrors, newPassword: null });
                  }
                }}
                error={passwordErrors.newPassword}
                required
                disabled={isUpdatingPassword}
                showStrengthMeter={true}
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm New Password"
                id="confirmPassword"
                placeholder="Repeat new password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors({ ...passwordErrors, confirmPassword: null });
                  }
                }}
                error={passwordErrors.confirmPassword}
                required
                disabled={isUpdatingPassword}
                autoComplete="new-password"
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
        <CardHeader className="bg-rose-50/40 rounded-t-2xl border-b border-rose-100">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" aria-hidden="true" />
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
            <Alert variant="error" onClose={() => setDeactivateError("")}>
              {deactivateError}
            </Alert>
          )}

          <PasswordInput
            label="Current Password"
            id="deactPassword"
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
    </CustomerShell>
  );
}
