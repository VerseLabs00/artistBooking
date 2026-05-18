export default function StatusBadge({ status }) {
  const map = {
    verified: 'badge-verified',
    active: 'badge-active',
    pending: 'badge-pending',
    waiting: 'badge-waiting',
    suspended: 'badge-suspended',
    banned: 'badge-suspended',
    confirmed: 'badge-active',
    completed: 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold',
    cancelled: 'badge-suspended',
  }
  const labels = {
    verified: 'Verified',
    active: 'Active',
    pending: 'Pending',
    waiting: 'Waiting',
    suspended: 'Suspended',
    banned: 'Banned',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return (
    <span className={map[status] || 'badge-pending'}>
      {labels[status] || status}
    </span>
  )
}
