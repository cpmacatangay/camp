import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Logo from "../components/Logo";
import { registerParticipant } from "../api/client";
import { useToast } from "../components/Toast";
import TextField from "../components/form/TextField";
import TextAreaField from "../components/form/TextAreaField";
import DateField from "../components/form/DateField";
import PaymentSection from "../components/form/PaymentSection";
import { PHONE_FIELDS, stripPhoneInput, applySentenceCase, validateField, validateFile, validateAll } from "../lib/validation";

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

const STEPS = [
  {
    key: "camper",
    label: "Camper",
    fields: ["name", "nickname", "birthDate", "email", "contactNumber", "facebookName", "homeAddress"],
  },
  {
    key: "parents",
    label: "Parents",
    fields: ["fatherName", "fatherContact", "motherName", "motherContact"],
  },
  { key: "payment", label: "Payment", fields: [] },
];

export default function Register() {
  const [form, setForm] = useState(INITIAL);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [stepNotice, setStepNotice] = useState("");
  const formTopRef = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    document.title = "TRAILBLAZE - Register";
  }, []);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);
  const toast = useToast();
  const navigate = useNavigate();

  function set(field) {
    return (e) => {
      let newVal = e.target.value;
      if (PHONE_FIELDS.includes(field)) {
        newVal = stripPhoneInput(newVal);
      }
      newVal = applySentenceCase(field, newVal);
      setForm((prev) => {
        const next = { ...prev, [field]: newVal };
        const fieldErr = validateField(field, next)[field];
        setErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };
          if (fieldErr) nextErrors[field] = fieldErr;
          else delete nextErrors[field];
          return nextErrors;
        });
        return next;
      });
      setStepNotice("");
    };
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
    const errs = validateAll(form, { file });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep(stepIdx) {
    const fields = STEPS[stepIdx].fields;
    const errs = {};
    for (const f of fields) {
      const e = validateField(f, form)[f];
      if (e) errs[f] = e;
    }
    if (stepIdx === 2) {
      if (form.paymentStatus === "yes" && !file) {
        errs.paymentScreenshot = "Payment screenshot is required";
      }
      const fileErr = validateFile(file);
      if (fileErr) errs.paymentScreenshot = fileErr;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (step < STEPS.length - 1) {
      if (validateStep(step)) {
        setStep((s) => s + 1);
        setStepNotice("");
      } else {
        const remaining = STEPS[step].fields.filter((f) => !form[f].trim()).length;
        setStepNotice(
          remaining > 0
            ? `${remaining} field${remaining === 1 ? "" : "s"} still need${remaining === 1 ? "s" : ""} attention below`
            : "Please fix the highlighted fields to continue",
        );
      }
    }
  }

  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
    setStepNotice("");
    setErrors({});
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

  const stepRemaining = STEPS[step].fields.filter((f) => !form[f].trim()).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <Logo size={44} withText={false} />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-pine-800 tracking-tight">
          TRAILBLAZE
        </h1>
        <p className="text-gray-500 mt-2">Camp registration</p>
      </div>

      {/* Trail checkpoints */}
      <ol className="flex items-center justify-center gap-2 sm:gap-3 mb-8" aria-label="Progress">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.key} className="flex items-center gap-2 sm:gap-3">
              <span
                className={`flex items-center gap-2 ${active ? "text-pine-800" : "text-gray-500"}`}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border ${
                    done
                      ? "bg-pine-700 border-pine-700 text-white"
                      : active
                        ? "border-blaze-500 text-blaze-600 ring-2 ring-blaze-100"
                        : "border-gray-300 text-gray-500"
                  }`}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
              </span>
              {i < STEPS.length - 1 && (
                <span className={`h-px w-6 sm:w-12 ${i < step ? "bg-pine-400" : "bg-gray-200"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div ref={formTopRef} className="bg-white rounded-2xl shadow-sm border border-trail-200 p-6 sm:p-8 scroll-mt-4">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {errors._form && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {errors._form}
            </div>
          )}

          {stepNotice && (
            <div className="bg-blaze-50 border border-blaze-200 text-blaze-800 rounded-lg px-4 py-2.5 text-sm font-medium">
              {stepNotice}
            </div>
          )}

          {step === 0 && (
            <>
              <p className="text-base font-semibold text-gray-800">Camper information</p>
              <p className="text-xs text-gray-500 -mt-3">All fields are required unless noted.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label="Name" value={form.name} onChange={set("name")} onBlur={() => handleBlur("name")} error={errors.name} required showBadge={false} autoComplete="name" />
                <TextField label="Nickname" value={form.nickname} onChange={set("nickname")} onBlur={() => handleBlur("nickname")} error={errors.nickname} required showBadge={false} />
                <DateField label="Birth Date" value={form.birthDate} onChange={set("birthDate")} onBlur={() => handleBlur("birthDate")} error={errors.birthDate} required showBadge={false} />
                <TextField label="Email" type="email" value={form.email} onChange={set("email")} onBlur={() => handleBlur("email")} error={errors.email} required showBadge={false} autoComplete="email" />
                <TextField label="Contact Number" value={form.contactNumber} onChange={set("contactNumber")} onBlur={() => handleBlur("contactNumber")} error={errors.contactNumber} required showBadge={false} autoComplete="tel" />
                <TextField label="Facebook Name" value={form.facebookName} onChange={set("facebookName")} onBlur={() => handleBlur("facebookName")} error={errors.facebookName} required showBadge={false} />
              </div>
              <TextAreaField label="Home Address" value={form.homeAddress} onChange={set("homeAddress")} onBlur={() => handleBlur("homeAddress")} error={errors.homeAddress} required showBadge={false} />
              <TextAreaField label="Existing Sickness / Illness (optional)" value={form.existingSickness} onChange={set("existingSickness")} />
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-base font-semibold text-gray-800">Parents / Guardian information</p>
              <p className="text-xs text-gray-500 -mt-3">All fields are required.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label="Father's Name" value={form.fatherName} onChange={set("fatherName")} onBlur={() => handleBlur("fatherName")} error={errors.fatherName} required showBadge={false} />
                <TextField label="Father's Contact" value={form.fatherContact} onChange={set("fatherContact")} onBlur={() => handleBlur("fatherContact")} error={errors.fatherContact} required showBadge={false} autoComplete="tel" />
                <TextField label="Mother's Name" value={form.motherName} onChange={set("motherName")} onBlur={() => handleBlur("motherName")} error={errors.motherName} required showBadge={false} />
                <TextField label="Mother's Contact" value={form.motherContact} onChange={set("motherContact")} onBlur={() => handleBlur("motherContact")} error={errors.motherContact} required showBadge={false} autoComplete="tel" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-base font-semibold text-gray-800">Payment &amp; review</p>
              <PaymentSection
                paymentStatus={form.paymentStatus}
                onChange={set("paymentStatus")}
                file={file}
                setFile={setFile}
                error={errors.paymentScreenshot}
              />
              <div className="bg-trail-50 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Review your details
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    ["Name", form.name],
                    ["Birth date", form.birthDate],
                    ["Email", form.email],
                    ["Contact", form.contactNumber],
                    ["Father", `${form.fatherName} · ${form.fatherContact}`],
                    ["Mother", `${form.motherName} · ${form.motherContact}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-trail-200 py-1 last:border-0">
                      <dt className="text-gray-500">{k}</dt>
                      <dd className="text-gray-800 text-right font-medium">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-pine-800 px-3 py-3 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center justify-center gap-2 bg-pine-700 hover:bg-pine-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer min-h-[48px] shadow-sm hover:shadow-md"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-blaze-500 hover:bg-blaze-600 disabled:bg-blaze-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[48px] shadow-sm hover:shadow-md"
              >
                <Send size={18} />
                {submitting ? "Submitting..." : "Submit Registration"}
              </button>
            )}
          </div>
          {step < STEPS.length - 1 && stepRemaining > 0 && (
            <p className="text-xs text-gray-500 text-right -mt-3">
              {stepRemaining} field{stepRemaining === 1 ? "" : "s"} left in this step
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
