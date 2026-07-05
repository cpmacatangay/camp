import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import RequiredBadge from './RequiredBadge'

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
  }, [participant, open])

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
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
  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300`
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 mb-10">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Participant' : 'Add New Participant'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name <RequiredBadge /></label>
              <input className={inputClass()} value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className={labelClass}>Nickname <RequiredBadge /></label>
              <input className={inputClass()} value={form.nickname} onChange={set('nickname')} required />
            </div>
            <div>
              <label className={labelClass}>Birth Date <RequiredBadge /></label>
              <input type="date" className={inputClass()} value={form.birthDate} onChange={set('birthDate')} required />
            </div>
            <div>
              <label className={labelClass}>Email <RequiredBadge /></label>
              <input type="email" className={inputClass()} value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className={labelClass}>Contact Number <RequiredBadge /></label>
              <input className={inputClass()} value={form.contactNumber} onChange={set('contactNumber')} required />
            </div>
            <div>
              <label className={labelClass}>Facebook Name <RequiredBadge /></label>
              <input className={inputClass()} value={form.facebookName} onChange={set('facebookName')} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Home Address <RequiredBadge /></label>
            <textarea rows={2} className={inputClass()} value={form.homeAddress} onChange={set('homeAddress')} required />
          </div>

          <div>
            <label className={labelClass}>Existing Sickness / Illness</label>
            <textarea rows={2} className={inputClass()} value={form.existingSickness} onChange={set('existingSickness')} />
          </div>

          <fieldset className="border rounded-lg p-4">
            <legend className="text-sm font-medium text-gray-700 px-2">Parents / Guardian</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className={labelClass}>Father's Name <RequiredBadge /></label>
                <input className={inputClass()} value={form.fatherName} onChange={set('fatherName')} required />
              </div>
              <div>
                <label className={labelClass}>Father's Contact <RequiredBadge /></label>
                <input className={inputClass()} value={form.fatherContact} onChange={set('fatherContact')} required />
              </div>
              <div>
                <label className={labelClass}>Mother's Name <RequiredBadge /></label>
                <input className={inputClass()} value={form.motherName} onChange={set('motherName')} required />
              </div>
              <div>
                <label className={labelClass}>Mother's Contact <RequiredBadge /></label>
                <input className={inputClass()} value={form.motherContact} onChange={set('motherContact')} required />
              </div>
            </div>
          </fieldset>

          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <label className={labelClass}>Payment Status</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pmt" value="yes" checked={form.paymentStatus === 'yes'} onChange={set('paymentStatus')} className="accent-green-600" />
                  <span className="text-sm">Paid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pmt" value="no" checked={form.paymentStatus === 'no'} onChange={set('paymentStatus')} className="accent-green-600" />
                  <span className="text-sm">Not Paid</span>
                </label>
              </div>
            </div>
            {form.paymentStatus === 'yes' && (
              <div>
                <label className={labelClass}>
                  {isEdit ? 'Update Payment Screenshot (leave empty to keep current)' : <>Payment Screenshot <RequiredBadge /></>}
                </label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:bg-green-400 cursor-pointer">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Participant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
