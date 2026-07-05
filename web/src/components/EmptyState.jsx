import { Users } from 'lucide-react'

export default function EmptyState({ onAdd }) {
  return (
    <tr>
      <td colSpan={4} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-gray-100 rounded-full p-3">
            <Users size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No participants found</p>
          <button
            onClick={onAdd}
            className="text-sm text-green-700 underline hover:text-green-800 cursor-pointer"
          >
            Add the first participant
          </button>
        </div>
      </td>
    </tr>
  )
}
