import { Users, Search } from 'lucide-react'

export default function EmptyState({ onAdd, onClearFilters, filtering = false }) {
  return (
    <tr>
      <td colSpan={5} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-gray-100 rounded-full p-3">
            {filtering ? (
              <Search size={28} className="text-gray-500" />
            ) : (
              <Users size={28} className="text-gray-500" />
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {filtering ? 'No participants match your search' : 'No participants yet'}
          </p>
          <button
            onClick={filtering ? onClearFilters : onAdd}
            className="text-sm text-pine-700 underline hover:text-pine-800 cursor-pointer"
          >
            {filtering ? 'Clear search & filters' : 'Add the first participant'}
          </button>
        </div>
      </td>
    </tr>
  )
}
