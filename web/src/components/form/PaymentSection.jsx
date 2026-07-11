import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import RequiredBadge from '../RequiredBadge'
import client from '../../api/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export default function PaymentSection({ paymentStatus, onChange, file, setFile, error, isEdit, existingScreenshotUrl, screenshotRequired = true }) {
  const [screenshotSrc, setScreenshotSrc] = useState(null)

  useEffect(() => {
    if (!isEdit || !existingScreenshotUrl) {
      setScreenshotSrc(null)
      return
    }
    let cancelled = false
    client.get(existingScreenshotUrl, { responseType: 'blob' }).then(({ data }) => {
      if (!cancelled) setScreenshotSrc(URL.createObjectURL(data))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [isEdit, existingScreenshotUrl])
  function validateAndSet(selected) {
    if (!selected) {
      setFile(null)
      return
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFile(selected)
      return
    }
    if (selected.size > MAX_SIZE) {
      setFile(selected)
      return
    }
    setFile(selected)
  }

  const fileError = error || (file && !ALLOWED_TYPES.includes(file.type) ? 'Only JPEG, PNG, or WebP images' : null) ||
    (file && file.size > MAX_SIZE ? 'File must be under 5MB' : null)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Payment Status <RequiredBadge />
        </label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentStatus"
              value="yes"
              checked={paymentStatus === 'yes'}
              onChange={onChange}
              className="accent-green-600"
            />
            <span className="text-base">Paid</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentStatus"
              value="no"
              checked={paymentStatus === 'no'}
              onChange={onChange}
              className="accent-green-600"
            />
            <span className="text-base">Not Paid</span>
          </label>
        </div>
      </div>

      {paymentStatus === 'yes' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEdit ? 'Update Payment Screenshot (leave empty to keep current)' : <>Payment Screenshot {screenshotRequired && <RequiredBadge />}</>}
          </label>
          {screenshotSrc && isEdit && (
            <img
              src={screenshotSrc}
              alt="Current payment screenshot"
              className="h-24 w-auto rounded border mb-2 object-cover"
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 hover:border-green-400 transition-colors">
            <Upload size={20} className="text-gray-400" />
            <span className="text-base text-gray-500">
              {file ? file.name : 'Choose image (JPEG, PNG, WebP — max 5MB)'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => validateAndSet(e.target.files[0])}
            />
          </label>
          {fileError && (
            <p className="text-red-500 text-sm mt-1">{fileError}</p>
          )}
        </div>
      )}
    </div>
  )
}
