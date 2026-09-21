"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../../context/ToastContext";
import { apiRequest } from "../../../lib/api";
import { servicesApi } from "../../../lib/services";
import {
  validateEmail,
  validateIndianPhone,
  validatePassword,
} from "../../../lib/validation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import PasswordInput from "../../../components/ui/PasswordInput";
import Alert from "../../../components/ui/Alert";
import { Card, CardContent } from "../../../components/ui/Card";
import {
  Wrench,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Check,
  Calendar,
} from "lucide-react";

export default function PartnerRegisterPage() {
  const router = useRouter();
  const toast = useToast();

  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    latitude: "28.613900",
    longitude: "77.209000",
    serviceRadiusKm: "25.0",
    openingTime: "09:00",
    closingTime: "19:00",
    workingDays: "Monday - Saturday",
    serviceCatalogIds: [],
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const services = await (servicesApi.getPublicServices ? servicesApi.getPublicServices() : servicesApi.getServices());
        if (Array.isArray(services)) {
          setAvailableServices(services);
          // Default select all available active services
          setFormData((prev) => ({
            ...prev,
            serviceCatalogIds: services.map((s) => s.id),
          }));
        }
      } catch (err) {
        console.error("Failed to load services for partner onboarding:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, []);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const handleToggleService = (serviceId) => {
    setFormData((prev) => {
      const current = prev.serviceCatalogIds || [];
      const updated = current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId];
      return { ...prev, serviceCatalogIds: updated };
    });
  };

  const handleSelectAllServices = () => {
    setFormData((prev) => ({
      ...prev,
      serviceCatalogIds: availableServices.map((s) => s.id),
    }));
  };

  const handleDeselectAllServices = () => {
    setFormData((prev) => ({
      ...prev,
      serviceCatalogIds: [],
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setIsLocating(false);
        toast.success("Workshop GPS coordinates detected!");
      },
      (err) => {
        setIsLocating(false);
        toast.error("Could not retrieve GPS coordinates: " + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCityPreset = (cityName, stateName, lat, lng, pin) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      state: stateName,
      latitude: lat,
      longitude: lng,
      pincode: pin,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {};

    if (!formData.businessName || formData.businessName.trim().length < 3) {
      newErrors.businessName = "Workshop / Business name must be at least 3 characters";
    }

    if (!formData.ownerName || formData.ownerName.trim().length < 2) {
      newErrors.ownerName = "Owner name must be at least 2 characters";
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validateIndianPhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = "Workshop address is required (at least 5 characters)";
    }

    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = "City is required";
    }

    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode || !/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit Indian PIN code";
    }

    const latVal = parseFloat(formData.latitude);
    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      newErrors.latitude = "Enter a valid latitude between -90 and 90";
    }

    const lngVal = parseFloat(formData.longitude);
    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      newErrors.longitude = "Enter a valid longitude between -180 and 180";
    }

    const radiusVal = parseFloat(formData.serviceRadiusKm);
    if (isNaN(radiusVal) || radiusVal <= 0 || radiusVal > 200) {
      newErrors.serviceRadiusKm = "Enter a service radius between 1 and 200 km";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the Workshop Partner Terms & Platform Policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the errors in the form");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        businessName: formData.businessName.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        serviceRadiusKm: parseFloat(formData.serviceRadiusKm),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        workingDays: formData.workingDays,
        serviceCatalogIds: formData.serviceCatalogIds,
      };

      const res = await apiRequest("/workshops/register", {
        method: "POST",
        requiresAuth: false,
        body: payload,
      });

      setRegistrationSuccess(res?.data || { businessName: formData.businessName });
      toast.success("Workshop registration submitted successfully!");
    } catch (err) {
      const msg = err.message || "Registration failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
              Verification Status: Pending Admin Review
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Registration Submitted!
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Thank you for registering <strong className="text-slate-900">{registrationSuccess.businessName}</strong>.
              Your service centre application has been securely submitted to the administrative portal for geographic verification and onboarding.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs text-slate-600">
            <p className="font-bold text-slate-900">What happens next?</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Our platform admin reviews your workshop details and coverage radius.</li>
              <li>Once verified, your account is activated (`isActive = true`).</li>
              <li>You can log in to view incoming customer requests in your area.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Go to Partner Sign In
              </Button>
            </Link>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Service Centre Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register as an Authorized Workshop Partner
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Expand your garage business. Receive verified, high-intent customer bookings within your exact service radius.
          </p>
        </div>

        {serverError && (
          <Alert variant="danger" title="Registration Error">
            {serverError}
          </Alert>
        )}

        <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* SECTION 1: BUSINESS & OWNER */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>1. Business & Contact Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Workshop / Business Name *"
                    id="businessName"
                    placeholder="e.g. Apex Precision Motors"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                    required
                  />
                  <Input
                    label="Proprietor / Owner Name *"
                    id="ownerName"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.ownerName}
                    onChange={handleChange}
                    error={errors.ownerName}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Workshop Email Address *"
                    id="email"
                    type="email"
                    placeholder="partner@workshop.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Contact Phone Number *"
                    id="phone"
                    placeholder="10-digit mobile (e.g. 9876543210)"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordInput
                    label="Partner Portal Password *"
                    id="password"
                    placeholder="Min 8 chars, mixed case, number, symbol"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                  />
                  <PasswordInput
                    label="Confirm Password *"
                    id="confirmPassword"
                    placeholder="Re-type your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                  />
                </div>
              </div>

              {/* SECTION 2: GEO-LOCATION & SERVICE RADIUS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>2. Workshop Location & Geographic Dispatch</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all border border-blue-200 cursor-pointer disabled:opacity-60"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                    <span>{isLocating ? "Locating..." : "Detect Workshop GPS"}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Our dispatch algorithm computes Haversine distances from customer service requests to ensure you only receive leads within your configured service radius.
                </p>

                {/* Popular City Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Hub Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "New Delhi", state: "Delhi", lat: "28.613900", lng: "77.209000", pin: "110001" },
                      { name: "Gurgaon", state: "Haryana", lat: "28.459500", lng: "77.026600", pin: "122001" },
                      { name: "Noida", state: "Uttar Pradesh", lat: "28.535500", lng: "77.391000", pin: "201301" },
                      { name: "Mumbai", state: "Maharashtra", lat: "19.076000", lng: "72.877700", pin: "400001" },
                      { name: "Bengaluru", state: "Karnataka", lat: "12.971600", lng: "77.594600", pin: "560001" },
                    ].map((hub) => (
                      <button
                        key={hub.name}
                        type="button"
                        onClick={() => handleCityPreset(hub.name, hub.state, hub.lat, hub.lng, hub.pin)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          formData.city === hub.name
                            ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                        }`}
                      >
                        {hub.name}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Workshop Street Address & Landmark *"
                  id="address"
                  placeholder="Plot / Unit No., Industrial Area, Street, Landmark"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City *"
                    id="city"
                    placeholder="e.g. New Delhi"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                    required
                  />
                  <Input
                    label="State *"
                    id="state"
                    placeholder="e.g. Delhi"
                    value={formData.state}
                    onChange={handleChange}
                    error={errors.state}
                    required
                  />
                  <Input
                    label="PIN Code *"
                    id="pincode"
                    placeholder="6-digit PIN"
                    value={formData.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Latitude Coordinates *"
                    id="latitude"
                    placeholder="e.g. 28.613900"
                    value={formData.latitude}
                    onChange={handleChange}
                    error={errors.latitude}
                    required
                  />
                  <Input
                    label="Longitude Coordinates *"
                    id="longitude"
                    placeholder="e.g. 77.209000"
                    value={formData.longitude}
                    onChange={handleChange}
                    error={errors.longitude}
                    required
                  />
                  <Input
                    label="Service Radius (km) *"
                    id="serviceRadiusKm"
                    placeholder="e.g. 25.0"
                    value={formData.serviceRadiusKm}
                    onChange={handleChange}
                    error={errors.serviceRadiusKm}
                    required
                  />
                </div>
              </div>

              {/* SECTION 3: OPERATING HOURS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>3. Operating Hours & Schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Opening Time"
                    id="openingTime"
                    type="time"
                    value={formData.openingTime}
                    onChange={handleChange}
                    error={errors.openingTime}
                  />
                  <Input
                    label="Closing Time"
                    id="closingTime"
                    type="time"
                    value={formData.closingTime}
                    onChange={handleChange}
                    error={errors.closingTime}
                  />
                  <Input
                    label="Working Days"
                    id="workingDays"
                    placeholder="e.g. Monday - Saturday"
                    value={formData.workingDays}
                    onChange={handleChange}
                    error={errors.workingDays}
                  />
                </div>
              </div>

              {/* SECTION 4: SERVICE CAPABILITIES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>4. Service Packages Offered</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllServices}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllServices}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Select the services your facility is equipped and certified to handle. You will only receive leads for services you support.
                </p>

                {loadingServices ? (
                  <p className="text-xs text-slate-400">Loading active catalog services...</p>
                ) : availableServices.length === 0 ? (
                  <p className="text-xs text-slate-400">No active catalog services configured currently.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {availableServices.map((service) => {
                      const isSelected = formData.serviceCatalogIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleToggleService(service.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-50/60 border-blue-500 text-blue-900 font-semibold"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-xs">
                            <p className="font-semibold">{service.name}</p>
                            <span className="text-[11px] text-slate-500">{service.category}</span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-blue-600 text-white" : "border border-slate-300"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TERMS & SUBMIT */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-slate-600 cursor-pointer">
                    I confirm that the workshop details and geographic location provided are accurate.
                    I agree to the <span className="font-bold text-slate-800">Workshop Partner SLA</span> and acknowledge that my account will undergo administrative verification before leads can be accepted.
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-600 font-medium">{errors.agreeTerms}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  rightIcon={ArrowRight}
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Workshop Registration"}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Already registered?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-slate-900 hover:text-blue-600 underline-offset-4 hover:underline"
                    >
                      Sign into Partner Dashboard
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
