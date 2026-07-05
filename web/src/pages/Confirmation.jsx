import { useLocation, Link } from 'react-router-dom'
import { Download, CheckCircle, ArrowLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Confirmation() {
  const { state } = useLocation()
  const { qrPngBase64, name } = state || {}
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!qrPngBase64 || !canvasRef.current) return
    const img = new window.Image()
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d')
      canvasRef.current.width = img.width
      canvasRef.current.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = qrPngBase64
  }, [qrPngBase64])

  function handleDownload() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'camp-qr-code.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  if (!state) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">No registration data found.</p>
        <Link to="/" className="text-green-700 underline hover:text-green-800">
          Go back to registration
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border p-6 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle size={40} className="text-green-700" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-green-800">Registration Complete!</h1>
          <p className="text-gray-500 mt-1">
            Welcome, <span className="font-semibold text-gray-800">{name}</span>
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 inline-block">
          {qrPngBase64 && (
            <img src={qrPngBase64} alt="QR Code" className="w-48 h-48 mx-auto" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <p className="text-xs text-gray-400">
          Present this QR code at check-in for fast attendance
        </p>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
        >
          <Download size={18} />
          Download QR Code
        </button>

        <Link
          to="/"
          className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          <ArrowLeft size={14} />
          Register another participant
        </Link>
      </div>
    </div>
  )
}
