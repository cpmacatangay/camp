import { useState, useEffect } from 'react'
import { X, CheckCircle2, Circle } from 'lucide-react'
import useModalA11y from '../hooks/useModalA11y'
import client from '../api/client'

export default function ViewParticipantModal({ open, participant, onClose }) {
  const { modalRef, titleId } = useModalA11y(open, onClose)
  const [screenshotSrc, setScreenshotSrc] = useState(null)

  useEffect(() => {
    setScreenshotSrc(null)
    if (!participant?.paymentScreenshotUrl) return
    let cancelled = false
    client.get(participant.paymentScreenshotUrl, { responseType: 'blob' })
      .then(({ data }) => { if (!cancelled) setScreenshotSrc(URL.createObjectURL(data)) })
      .catch(() => { if (!cancelled) setScreenshotSrc('error') })
    return () => { cancelled = true }
  }, [participant])

  if (!open || !participant) return null

  const p = participant

  function label(text) {
    return <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{text}</span>
  }

  function value(text) {
    return <span className="text-sm text-gray-800">{text || '—'}</span>
  }

  function row(labelText, val) {
    return (
      <div>
        {label(labelText)}
        <div className="mt-0.5">{value(val)}</div>
      </div>
    )
  }

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
            Participant Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <p className="text-base font-semibold text-gray-800 mb-3">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {row('Name', p.name)}
              {row('Nickname', p.nickname)}
              {row('Birth Date', new Date(p.birthDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
              {row('Email', p.email)}
              {row('Contact Number', p.contactNumber)}
              {row('Facebook Name', p.facebookName)}
            </div>
            <div className="mt-4">
              {row('Home Address', p.homeAddress)}
            </div>
            <div className="mt-4">
              {row('Existing Sickness / Illness', p.existingSickness || 'None')}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Parents / Guardian Information */}
          <div>
            <p className="text-base font-semibold text-gray-800 mb-3">Parents / Guardian Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {row("Father's Name", p.fatherName)}
              {row("Father's Contact", p.fatherContact)}
              {row("Mother's Name", p.motherName)}
              {row("Mother's Contact", p.motherContact)}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Payment & Status */}
          <div>
            <p className="text-base font-semibold text-gray-800 mb-3">Payment & Status</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {label('Payment Status')}
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.paymentStatus === 'yes'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.paymentStatus === 'yes'
                      ? <><CheckCircle2 size={12} /> Paid</>
                      : <><Circle size={12} /> Not Paid</>}
                  </span>
                </div>
              </div>
              <div>
                {label('Attendance')}
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.attendanceStatus === 'Present'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.attendanceStatus}
                  </span>
                </div>
              </div>
            </div>
            {p.paymentStatus === 'yes' && p.paymentScreenshotUrl && (
              <div className="mt-4">
                {label('Payment Screenshot')}
                <div className="mt-1">
                  {screenshotSrc === 'error' ? (
                    <p className="text-sm text-red-500">Failed to load screenshot</p>
                  ) : screenshotSrc ? (
                    <img
                      src={screenshotSrc}
                      alt="Payment screenshot"
                      className="h-32 w-auto rounded-lg border object-cover"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">Loading...</p>
                  )}
                </div>
              </div>
            )}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {row('Registered', new Date(p.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-4 sm:px-6 pb-4 sm:pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
