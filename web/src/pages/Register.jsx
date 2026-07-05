import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { registerParticipant } from '../api/client'
import { useToast } from '../components/Toast'
import TextField from '../components/form/TextField'
import TextAreaField from '../components/form/TextAreaField'
import DateField from '../components/form/DateField'
import ParentsFieldset from '../components/form/ParentsFieldset'
import PaymentSection from '../components/form/PaymentSection'

const INITIAL = {
  name: '',
  homeAddress: '',
  birthDate: '',
  contactNumber: '',
  email: '',
  nickname: '',
  facebookName: '',
  existingSickness: '',
  fatherName: '',
  fatherContact: '',
  motherName: '',
  motherContact: '',
  paymentStatus: 'no',
}

export default function Register() {
  const [form, setForm] = useState(INITIAL)
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function validate() {
    const errs = {}
    const required = [
      'name', 'homeAddress', 'birthDate', 'contactNumber', 'email',
      'nickname', 'facebookName', 'fatherName', 'fatherContact',
      'motherName', 'motherContact',
    ]
    for (const field of required) {
      if (!form[field].trim()) {
        errs[field] = 'This field is required'
      }
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email address'
    }
    if (form.paymentStatus === 'yes' && !file) {
      errs.paymentScreenshot = 'Payment screenshot is required'
    }
    if (file && file.size > 5 * 1024 * 1024) {
      errs.paymentScreenshot = 'File must be under 5MB'
    }
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      errs.paymentScreenshot = 'Only JPEG, PNG, or WebP images'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const fd = new FormData()
      for (const [key, val] of Object.entries(form)) {
        fd.append(key, val)
      }
      if (file) fd.append('paymentScreenshot', file)

      const result = await registerParticipant(fd)
      navigate('/confirmation', {
        state: {
          qrPngBase64: result.qrPngBase64,
          participantId: result.participant.id,
          name: result.participant.name,
        },
      })
    } catch (err) {
      const msg =
            err.response?.data?.message ||
            err.response?.data?.errors?.[0] ||
            'Registration failed. Please try again.'
          setErrors({ _form: msg })
          toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">Camp Registration</h1>
        <p className="text-gray-500 mt-1">Fill in all required fields to register</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
        {errors._form && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {errors._form}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Name" value={form.name} onChange={set('name')} error={errors.name} required />
          <TextField label="Nickname" value={form.nickname} onChange={set('nickname')} error={errors.nickname} required />
          <DateField label="Birth Date" value={form.birthDate} onChange={set('birthDate')} error={errors.birthDate} required />
          <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} required />
          <TextField label="Contact Number" value={form.contactNumber} onChange={set('contactNumber')} error={errors.contactNumber} required />
          <TextField label="Facebook Name" value={form.facebookName} onChange={set('facebookName')} error={errors.facebookName} required />
        </div>

        <TextAreaField label="Home Address" value={form.homeAddress} onChange={set('homeAddress')} error={errors.homeAddress} required />

        <TextAreaField label="Existing Sickness / Illness (optional)" value={form.existingSickness} onChange={set('existingSickness')} />

        <ParentsFieldset values={form} onChange={set} errors={errors} />

        <PaymentSection
          paymentStatus={form.paymentStatus}
          onChange={set('paymentStatus')}
          file={file}
          setFile={setFile}
          error={errors.paymentScreenshot}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-3.5 sm:py-3 rounded-lg transition-colors cursor-pointer min-h-[48px]"
        >
          <Send size={18} />
          {submitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  )
}
