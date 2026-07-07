import { useLocation, Link } from "react-router-dom";
import { Download, CheckCircle, ArrowLeft } from "lucide-react";

export default function Confirmation() {
  const { state } = useLocation();
  const { qrPngBase64, name } = state || {};

  if (!state) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">No registration data found.</p>
        <Link to="/" className="text-green-700 underline hover:text-green-800">
          Go back to registration
        </Link>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-green-800">
            Registration Complete!
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome, <span className="font-semibold text-gray-800">{name}</span>
          </p>
        </div>

        {qrPngBase64 && (
          <div className="bg-gray-50 rounded-xl p-4 inline-block">
            <img
              src={qrPngBase64}
              alt="QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>
        )}

        <p className="text-xs text-gray-400">
          Present this QR code when you arrive at the venue for faster
          attendance.
        </p>

        {qrPngBase64 && (
          <a
            href={qrPngBase64}
            download={`${name.replace(/[^a-zA-Z0-9_-]/g, "-")}-QR.png`}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
          >
            <Download size={18} />
            Download QR Code
          </a>
        )}

        <Link
          to="/"
          className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          <ArrowLeft size={14} />
          Register another participant
        </Link>
      </div>
    </div>
  );
}
