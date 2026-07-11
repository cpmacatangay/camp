import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { registerParticipant } from "../api/client";
import { useToast } from "../components/Toast";
import TextField from "../components/form/TextField";
import TextAreaField from "../components/form/TextAreaField";
import DateField from "../components/form/DateField";
import ParentsFieldset from "../components/form/ParentsFieldset";
import PaymentSection from "../components/form/PaymentSection";

const INITIAL = {
  name: "",
  homeAddress: "",
  birthDate: "",
  contactNumber: "",
  email: "",
  nickname: "",
  facebookName: "",
  existingSickness: "",
  fatherName: "",
  fatherContact: "",
  motherName: "",
  motherContact: "",
  paymentStatus: "no",
};

export default function Register() {
  const [form, setForm] = useState(INITIAL);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    document.title = "TRAILBLAZE - Register";
  }, []);
  const toast = useToast();
  const navigate = useNavigate();

  const phoneFields = ['contactNumber', 'fatherContact', 'motherContact'];

  function set(field) {
    return (e) => {
      let newVal = e.target.value;
      if (phoneFields.includes(field)) {
        newVal = newVal.replace(/[^\d+]/g, '');
      }
      newVal = immediateSentenceCase(field, newVal);
      setForm((prev) => {
        const next = { ...prev, [field]: newVal };
        const fieldErr = validateField(field, next)[field];
        setErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };
          if (fieldErr) {
            nextErrors[field] = fieldErr;
          } else {
            delete nextErrors[field];
          }
          return nextErrors;
        });
        return next;
      });
    };
  }

  function validateField(field, formValues) {
    const errs = {};
    const required = [
      "name",
      "homeAddress",
      "birthDate",
      "contactNumber",
      "email",
      "nickname",
      "facebookName",
      "fatherName",
      "fatherContact",
      "motherName",
      "motherContact",
    ];
    if (required.includes(field) && !formValues[field].trim()) {
      errs[field] = "This field is required";
    }
    if (
      field === "email" &&
      formValues.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    ) {
      errs.email = "Invalid email address";
    }
    if (
      field === "email" &&
      formValues.email &&
      /\.(con|co\.uk|neto)$/i.test(formValues.email)
    ) {
      errs.email = "Did you mean .com?";
    }
    function cleanPhone(v) {
      return v.replace(/[\s\-()]/g, "");
    }
    const PH_MOBILE = /^(?:\+63|0)9\d{9}$/;
    if (
      (field === "contactNumber" ||
        field === "fatherContact" ||
        field === "motherContact") &&
      formValues[field] &&
      !PH_MOBILE.test(cleanPhone(formValues[field]))
    ) {
      errs[field] = "Enter a valid contact number (e.g., 09171234567)";
    }
    if (field === "birthDate" && formValues.birthDate) {
      const parts = formValues.birthDate.split("-");
      const d = new Date(formValues.birthDate + "T00:00:00");
      const now = new Date();
      if (parts.length !== 3 || parts[0].length !== 4) {
        errs.birthDate = "Use YYYY-MM-DD format";
      } else if (isNaN(d.getTime())) {
        errs.birthDate = "Invalid date";
      } else if (d > now) {
        errs.birthDate = "Birth date cannot be in the future";
      } else {
        const age = now.getFullYear() - d.getFullYear();
        if (age < 5) errs.birthDate = "Must be at least 5 years old";
        else if (age > 21) errs.birthDate = "Age seems too old for this camp";
      }
    }
    const nameFieldsNoDigits = ["name", "nickname", "fatherName", "motherName"];
    if (
      nameFieldsNoDigits.includes(field) &&
      formValues[field] &&
      /\d/.test(formValues[field])
    ) {
      errs[field] = "Should not contain numbers";
    } else if (
      nameFieldsNoDigits.includes(field) &&
      formValues[field] &&
      formValues[field].trim().length < 2
    ) {
      errs[field] = "Must be at least 2 characters";
    }
    if (field === "facebookName" && formValues.facebookName) {
      if (/\d/.test(formValues.facebookName)) {
        errs.facebookName = "Should not contain numbers";
      } else if (/https?:\/\//i.test(formValues.facebookName)) {
        errs.facebookName = "Enter a name, not a URL";
      } else if (/facebook\.com|www\./i.test(formValues.facebookName)) {
        errs.facebookName = "Enter a name, not a profile link";
      } else if (formValues.facebookName.includes("@")) {
        errs.facebookName = "Enter a name, not an email";
      }
    }
    if (
      field === "homeAddress" &&
      formValues.homeAddress &&
      formValues.homeAddress.trim().length < 5
    ) {
      errs.homeAddress = "Enter a full address (at least 5 characters)";
    }
    return errs;
  }

  const sentenceCaseFields = ['name', 'homeAddress', 'facebookName', 'fatherName', 'motherName'];

  function toSentenceCase(s) {
    return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  function immediateSentenceCase(field, value) {
    if (!sentenceCaseFields.includes(field)) return value;
    return toSentenceCase(value);
  }

  function handleBlur(field) {
    const fieldErr = validateField(field, form)[field];
    setErrors((prev) => {
      if (fieldErr) return { ...prev, [field]: fieldErr };
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }

  function validate() {
    const errs = {};
    const required = [
      "name",
      "homeAddress",
      "birthDate",
      "contactNumber",
      "email",
      "nickname",
      "facebookName",
      "fatherName",
      "fatherContact",
      "motherName",
      "motherContact",
    ];
    for (const field of required) {
      if (!form[field].trim()) {
        errs[field] = "This field is required";
      }
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email address";
    }
    if (form.email && /\.(con|co\.uk|neto)$/i.test(form.email)) {
      errs.email = "Did you mean .com?";
    }

    function cleanPhone(v) {
      return v.replace(/[\s\-()]/g, "");
    }
    const PH_MOBILE = /^(?:\+63|0)9\d{9}$/;
    if (form.contactNumber && !PH_MOBILE.test(cleanPhone(form.contactNumber))) {
      errs.contactNumber = "Enter a valid PH mobile number (e.g., 09171234567)";
    }
    if (form.fatherContact && !PH_MOBILE.test(cleanPhone(form.fatherContact))) {
      errs.fatherContact = "Enter a valid PH mobile number (e.g., 09171234567)";
    }
    if (form.motherContact && !PH_MOBILE.test(cleanPhone(form.motherContact))) {
      errs.motherContact = "Enter a valid PH mobile number (e.g., 09171234567)";
    }

    if (form.birthDate) {
      const parts = form.birthDate.split("-");
      if (parts.length !== 3 || parts[0].length !== 4) {
        errs.birthDate = "Use YYYY-MM-DD format";
      } else {
        const d = new Date(form.birthDate + "T00:00:00");
        const now = new Date();
        if (isNaN(d.getTime())) {
          errs.birthDate = "Invalid date";
        } else if (d > now) {
          errs.birthDate = "Birth date cannot be in the future";
        } else {
          const age = now.getFullYear() - d.getFullYear();
          if (age < 5) errs.birthDate = "Must be at least 5 years old";
          else if (age > 21) errs.birthDate = "Age seems too old for this camp";
        }
      }
    }

    const nameFieldsNoDigits = ["name", "nickname", "fatherName", "motherName"];
    for (const field of nameFieldsNoDigits) {
      if (form[field] && /\d/.test(form[field])) {
        errs[field] = "Should not contain numbers";
      } else if (form[field] && form[field].trim().length < 2) {
        errs[field] = "Must be at least 2 characters";
      }
    }

    if (form.facebookName) {
      if (/\d/.test(form.facebookName)) {
        errs.facebookName = "Should not contain numbers";
      } else if (/https?:\/\//i.test(form.facebookName)) {
        errs.facebookName = "Enter a name, not a URL";
      } else if (/facebook\.com|www\./i.test(form.facebookName)) {
        errs.facebookName = "Enter a name, not a profile link";
      } else if (form.facebookName.includes("@")) {
        errs.facebookName = "Enter a name, not an email";
      }
    }

    if (form.homeAddress && form.homeAddress.trim().length < 5) {
      errs.homeAddress = "Enter a full address (at least 5 characters)";
    }
    if (form.paymentStatus === "yes" && !file) {
      errs.paymentScreenshot = "Payment screenshot is required";
    }
    if (file && file.size > 5 * 1024 * 1024) {
      errs.paymentScreenshot = "File must be under 5MB";
    }
    if (
      file &&
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      errs.paymentScreenshot = "Only JPEG, PNG, or WebP images";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      for (const [key, val] of Object.entries(form)) {
        fd.append(key, val);
      }
      if (file) fd.append("paymentScreenshot", file);

      const result = await registerParticipant(fd);
      navigate("/confirmation", {
        state: {
          qrPngBase64: result.qrPngBase64,
          participantId: result.participant.id,
          name: result.participant.name,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setErrors({ _form: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const requiredFields = [
    "name",
    "homeAddress",
    "birthDate",
    "contactNumber",
    "email",
    "nickname",
    "facebookName",
    "fatherName",
    "fatherContact",
    "motherName",
    "motherContact",
  ];
  const hasAllRequired = requiredFields.every((f) => form[f].trim());
  const hasScreenshot = form.paymentStatus !== "yes" || file;
  const canSubmit = hasAllRequired && hasScreenshot;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-800 tracking-tight">
          TRAILBLAZE
        </h1>
        <p className="text-gray-500 mt-2">
          Fill in all required fields to register
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {errors._form && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {errors._form}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Name"
              value={form.name}
              onChange={set("name")}
              onBlur={() => handleBlur("name")}
              error={errors.name}
              required
            />
            <TextField
              label="Nickname"
              value={form.nickname}
              onChange={set("nickname")}
              onBlur={() => handleBlur("nickname")}
              error={errors.nickname}
              required
            />
            <DateField
              label="Birth Date"
              value={form.birthDate}
              onChange={set("birthDate")}
              onBlur={() => handleBlur("birthDate")}
              error={errors.birthDate}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              required
            />
            <TextField
              label="Contact Number"
              value={form.contactNumber}
              onChange={set("contactNumber")}
              onBlur={() => handleBlur("contactNumber")}
              error={errors.contactNumber}
              required
            />
            <TextField
              label="Facebook Name"
              value={form.facebookName}
              onChange={set("facebookName")}
              onBlur={() => handleBlur("facebookName")}
              error={errors.facebookName}
              required
            />
          </div>

          <TextAreaField
            label="Home Address"
            value={form.homeAddress}
            onChange={set("homeAddress")}
            onBlur={() => handleBlur("homeAddress")}
            error={errors.homeAddress}
            required
          />

          <TextAreaField
            label="Existing Sickness / Illness (optional)"
            value={form.existingSickness}
            onChange={set("existingSickness")}
          />

          <hr className="border-gray-200" />

          <ParentsFieldset
            values={form}
            onChange={set}
            errors={errors}
            onBlur={handleBlur}
          />

          <hr className="border-gray-200" />

          <PaymentSection
            paymentStatus={form.paymentStatus}
            onChange={set("paymentStatus")}
            file={file}
            setFile={setFile}
            error={errors.paymentScreenshot}
          />

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 active:bg-green-900 disabled:bg-emerald-400 text-white font-semibold py-3.5 sm:py-3 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed min-h-[48px] shadow-sm hover:shadow-md disabled:shadow-none"
          >
            <Send size={18} />
            {submitting ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
