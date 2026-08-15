export const REQUIRED_FIELDS = [
  'name', 'homeAddress', 'birthDate', 'contactNumber', 'email',
  'nickname', 'facebookName', 'fatherName', 'fatherContact',
  'motherName', 'motherContact',
]

export const PHONE_FIELDS = ['contactNumber', 'fatherContact', 'motherContact']
export const NAME_FIELDS = ['name', 'nickname', 'fatherName', 'motherName']
export const SENTENCE_CASE_FIELDS = ['name', 'homeAddress', 'facebookName', 'fatherName', 'motherName']

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 5 * 1024 * 1024

const PH_MOBILE = /^(?:\+63|0)9\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function cleanPhone(v) {
  return v.replace(/[\s\-()]/g, '')
}

export function toSentenceCase(s) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

export function stripPhoneInput(value) {
  return value.replace(/[^\d+]/g, '')
}

export function applySentenceCase(field, value) {
  return SENTENCE_CASE_FIELDS.includes(field) ? toSentenceCase(value) : value
}

export function validateField(field, form) {
  const errs = {}
  const v = (form[field] ?? '').toString()

  if (REQUIRED_FIELDS.includes(field) && !v.trim()) {
    errs[field] = 'This field is required'
    return errs
  }

  if (field === 'email' && v) {
    if (!EMAIL_RE.test(v)) errs.email = 'Invalid email address'
    else if (/\.(con|co\.uk|neto)$/i.test(v)) errs.email = 'Did you mean .com?'
  }

  if (PHONE_FIELDS.includes(field) && v && !PH_MOBILE.test(cleanPhone(v))) {
    errs[field] = 'Enter a valid contact number (e.g., 09171234567)'
  }

  if (field === 'birthDate' && v) {
    const parts = v.split('-')
    const d = new Date(v + 'T00:00:00')
    const now = new Date()
    if (parts.length !== 3 || parts[0].length !== 4) {
      errs.birthDate = 'Use YYYY-MM-DD format'
    } else if (isNaN(d.getTime())) {
      errs.birthDate = 'Invalid date'
    } else if (d > now) {
      errs.birthDate = 'Birth date cannot be in the future'
    } else {
      const age = now.getFullYear() - d.getFullYear()
      if (age < 5) errs.birthDate = 'Camper must be at least 5 years old'
      else if (age > 21) errs.birthDate = 'Campers are 5–21 years old'
    }
  }

  if (NAME_FIELDS.includes(field) && v) {
    if (/\d/.test(v)) errs[field] = 'Should not contain numbers'
    else if (v.trim().length < 2) errs[field] = 'Must be at least 2 characters'
  }

  if (field === 'facebookName' && v) {
    if (/\d/.test(v)) errs.facebookName = 'Should not contain numbers'
    else if (/https?:\/\//i.test(v)) errs.facebookName = 'Enter a name, not a URL'
    else if (/facebook\.com|www\./i.test(v)) errs.facebookName = 'Enter a name, not a profile link'
    else if (v.includes('@')) errs.facebookName = 'Enter a name, not an email'
  }

  if (field === 'homeAddress' && v && v.trim().length < 5) {
    errs.homeAddress = 'Enter a full address (at least 5 characters)'
  }

  return errs
}

export function validateFile(file) {
  if (file && file.size > MAX_FILE_SIZE) return 'File must be under 5MB'
  if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG, or WebP images'
  return null
}

export function validateAll(form, { file = null, requireScreenshot = true } = {}) {
  const errs = {}
  for (const field of REQUIRED_FIELDS) {
    Object.assign(errs, validateField(field, form))
  }
  if (requireScreenshot && form.paymentStatus === 'yes' && !file) {
    errs.paymentScreenshot = 'Payment screenshot is required'
  }
  const fileErr = validateFile(file)
  if (fileErr) errs.paymentScreenshot = fileErr
  return errs
}
