export default function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="border-b last:border-0 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" style={i === cols - 1 ? { marginLeft: 'auto', width: '40%' } : {}} />
        </td>
      ))}
    </tr>
  )
}
