import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useModalA11y from '../hooks/useModalA11y'
import TextField from './form/TextField'
import TextAreaField from './form/TextAreaField'
import DateField from './form/DateField'
import ParentsFieldset from './form/ParentsFieldset'
import PaymentSection from './form/PaymentSection'

const INITIAL = {
  name: '', homeAddress: '', birthDate: '', contactNumber: '', email: '',
  nickname: '', facebookName: '', existingSickness: '',
  fatherName: '', fatherContact: '', motherName: '', motherContact: '',
  paymentStatus: 'no',
}

export default function ParticipantModal({ open, participant, onSave, onClose }) {
  const [form, setForm] = useState(INITIAL)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const { modalRef, titleId } = useModalA11y(open, onClose)

  useEffect(() => {
    if (participant) {
      setForm({
        name: participant.name || '',
        homeAddress: participant.homeAddress || '',
        birthDate: participant.birthDate || '',
        contactNumber: participant.contactNumber || '',
        email: participant.email || '',
        nickname: participant.nickname || '',
        facebookName: participant.facebookName || '',
        existingSickness: participant.existingSickness || '',
        fatherName: participant.fatherName || '',
        fatherContact: participant.fatherContact || '',
        motherName: participant.motherName || '',
        motherContact: participant.motherContact || '',
        paymentStatus: participant.paymentStatus || 'no',
      })
    } else {
      setForm(INITIAL)
    }
    setFile(null)
    setErrors({})
  }, [participant, open])

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
    setSaving(true)
    try {
      const fd = new FormData()
      for (const [key, val] of Object.entries(form)) {
        fd.append(key, val)
      }
      if (file) fd.append('paymentScreenshot', file)
      await onSave(fd, participant?._id)
      onClose()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const isEdit = !!participant

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-10 bg-black/40 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={modalRef} className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 mb-4 sm:mb-10">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 id={titleId} className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Participant' : 'Add New Participant'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Name" value={form.name} onChange={set('name')} error={errors.name} required />
            <TextField label="Nickname" value={form.nickname} onChange={set('nickname')} error={errors.nickname} required />
            <DateField label="Birth Date" value={form.birthDate} onChange={set('birthDate')} error={errors.birthDate} required />
            <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} required />
            <TextField label="Contact Number" value={form.contactNumber} onChange={set('contactNumber')} error={errors.contactNumber} required />
            <TextField label="Facebook Name" value={form.facebookName} onChange={set('facebookName')} error={errors.facebookName} required />
          </div>

          <TextAreaField label="Home Address" value={form.homeAddress} onChange={set('homeAddress')} error={errors.homeAddress} required />

          <TextAreaField label="Existing Sickness / Illness" value={form.existingSickness} onChange={set('existingSickness')} />

          <ParentsFieldset values={form} onChange={set} errors={errors} />

          <PaymentSection
            paymentStatus={form.paymentStatus}
            onChange={set('paymentStatus')}
            file={file}
            setFile={setFile}
            error={errors.paymentScreenshot}
            isEdit={isEdit}
            existingScreenshotUrl={isEdit ? participant.paymentScreenshotUrl : undefined}
            screenshotRequired={false}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer min-h-[44px] sm:min-h-0">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:bg-green-400 cursor-pointer min-h-[44px] sm:min-h-0">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Participant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
