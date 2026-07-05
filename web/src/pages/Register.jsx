import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Send } from 'lucide-react'
import { registerParticipant } from '../api/client'
import RequiredBadge from '../components/RequiredBadge'

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
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Camp Registration</h1>
        <p className="text-gray-500 mt-1">Fill in all required fields to register</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl shadow-sm border p-6">
        {errors._form && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {errors._form}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name <RequiredBadge /></label>
            <input className={inputClass('name')} value={form.name} onChange={set('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Nickname <RequiredBadge /></label>
            <input className={inputClass('nickname')} value={form.nickname} onChange={set('nickname')} />
            {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
          </div>
          <div>
            <label className={labelClass}>Birth Date <RequiredBadge /></label>
            <input type="date" className={inputClass('birthDate')} value={form.birthDate} onChange={set('birthDate')} />
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>
          <div>
            <label className={labelClass}>Email <RequiredBadge /></label>
            <input type="email" className={inputClass('email')} value={form.email} onChange={set('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className={labelClass}>Contact Number <RequiredBadge /></label>
            <input className={inputClass('contactNumber')} value={form.contactNumber} onChange={set('contactNumber')} />
            {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
          </div>
          <div>
            <label className={labelClass}>Facebook Name <RequiredBadge /></label>
            <input className={inputClass('facebookName')} value={form.facebookName} onChange={set('facebookName')} />
            {errors.facebookName && <p className="text-red-500 text-xs mt-1">{errors.facebookName}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Home Address <RequiredBadge /></label>
          <textarea rows={2} className={inputClass('homeAddress')} value={form.homeAddress} onChange={set('homeAddress')} />
          {errors.homeAddress && <p className="text-red-500 text-xs mt-1">{errors.homeAddress}</p>}
        </div>

        <div>
          <label className={labelClass}>Existing Sickness / Illness (optional)</label>
          <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.existingSickness} onChange={set('existingSickness')} />
        </div>

        <fieldset className="border rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">Parents / Guardian Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className={labelClass}>Father's Name <RequiredBadge /></label>
              <input className={inputClass('fatherName')} value={form.fatherName} onChange={set('fatherName')} />
              {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
            </div>
            <div>
              <label className={labelClass}>Father's Contact <RequiredBadge /></label>
              <input className={inputClass('fatherContact')} value={form.fatherContact} onChange={set('fatherContact')} />
              {errors.fatherContact && <p className="text-red-500 text-xs mt-1">{errors.fatherContact}</p>}
            </div>
            <div>
              <label className={labelClass}>Mother's Name <RequiredBadge /></label>
              <input className={inputClass('motherName')} value={form.motherName} onChange={set('motherName')} />
              {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
            </div>
            <div>
              <label className={labelClass}>Mother's Contact <RequiredBadge /></label>
              <input className={inputClass('motherContact')} value={form.motherContact} onChange={set('motherContact')} />
              {errors.motherContact && <p className="text-red-500 text-xs mt-1">{errors.motherContact}</p>}
            </div>
          </div>
        </fieldset>

        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <label className={labelClass}>Payment Status <RequiredBadge /></label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="yes"
                  checked={form.paymentStatus === 'yes'}
                  onChange={set('paymentStatus')}
                  className="accent-green-600"
                />
                <span className="text-sm">Paid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="no"
                  checked={form.paymentStatus === 'no'}
                  onChange={set('paymentStatus')}
                  className="accent-green-600"
                />
                <span className="text-sm">Not Paid</span>
              </label>
            </div>
          </div>

          {form.paymentStatus === 'yes' && (
            <div>
              <label className={labelClass}>Upload Payment Screenshot <RequiredBadge /></label>
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 hover:border-green-400 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {file ? file.name : 'Choose image (JPEG, PNG, WebP — max 5MB)'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              {errors.paymentScreenshot && (
                <p className="text-red-500 text-xs mt-1">{errors.paymentScreenshot}</p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
        >
          <Send size={18} />
          {submitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  )
}
