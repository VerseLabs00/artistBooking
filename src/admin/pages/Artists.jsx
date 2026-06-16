import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2, Check, X } from 'lucide-react'
import {
  fetchArtists,
  verifyArtist,
  deleteArtist,
  setFilter,
  setSearchQuery,
  selectFilteredArtists,
} from '../features/artists/artistsSlice'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import SearchBar from '../components/common/SearchBar'
import FilterTabs from '../components/common/FilterTabs'
import StatusBadge from '../components/common/StatusBadge'

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
]

function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary px-5 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className={`${confirmClass} px-5 py-2 text-sm rounded-full font-semibold transition-all active:scale-95`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function Artists() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const allArtists = useSelector(s => s.artists.list)
  const filter = useSelector(s => s.artists.filter)
  const searchQuery = useSelector(s => s.artists.searchQuery)
  const filtered = useSelector(selectFilteredArtists)
  const { loading, error } = useSelector(s => s.artists)

  const [modal, setModal] = useState(null)
  const [selectedArtist, setSelectedArtist] = useState(null)

  useEffect(() => {
    dispatch(fetchArtists())
  }, [dispatch])

  const verified = allArtists.filter(a => a.status === 'verified').length
  const pending = allArtists.filter(a => a.status === 'pending').length
  const suspended = allArtists.filter(a => a.status === 'suspended').length

  const handleVerify = async (artist, status) => {
    const result = await dispatch(verifyArtist({ id: artist.id, status }))
    if (verifyArtist.fulfilled.match(result)) {
      status === 'approved'
        ? toast.success(`${artist.name} approved!`)
        : toast.error(`${artist.name} rejected.`)
    } else {
      toast.error(result.payload || 'Action failed')
    }
  }

  const handleDelete = async () => {
    if (!selectedArtist) return
    const result = await dispatch(deleteArtist(selectedArtist.id))
    if (deleteArtist.fulfilled.match(result)) {
      toast.success(`${selectedArtist.name} deleted successfully.`)
    } else {
      toast.error(result.payload || 'Delete failed')
    }
    setModal(null)
    setSelectedArtist(null)
  }

  const modalConfig = {
    delete: { 
      title: 'Delete Artist', 
      message: `Are you sure you want to permanently delete ${selectedArtist?.name}? This will remove all their data and access to the platform.`, 
      confirmLabel: 'Delete', 
      confirmClass: 'bg-red-600 text-white hover:bg-red-700', 
      onConfirm: handleDelete 
    },
  }

  return (
    <div>
      <PageHeader title="Artists" subtitle={`Manage all ${allArtists.length} artists on the platform.`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard label="Verified" value={verified} badge="Active" badgeColor="green" />
        <StatCard label="Pending" value={pending} badge="Waiting" badgeColor="orange" />
        <StatCard label="Suspended" value={suspended} badge="Active" badgeColor="red" />
        <StatCard label="Total" value={allArtists.length} badge="Active" badgeColor="green" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          <SearchBar value={searchQuery} onChange={v => dispatch(setSearchQuery(v))} placeholder="Search artist..." />
          <div className="overflow-x-auto w-full sm:w-auto">
            <FilterTabs tabs={filterTabs} active={filter} onChange={v => dispatch(setFilter(v))} />
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Loading artists...</div>
        )}
        {error && !loading && (
          <div className="text-center py-12 text-red-400 text-sm">{error}</div>
        )}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header text-left">Artist</th>
                  <th className="table-header text-left">Category</th>
                  <th className="table-header text-left hidden md:table-cell">Location</th>
                  <th className="table-header text-left hidden md:table-cell">Bookings</th>
                  <th className="table-header text-left">Rating</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      No artists found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(artist => (
                    <tr key={artist.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2 md:gap-3">
                          <img src={artist.avatar} alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{artist.name}</p>
                            <p className="text-xs text-gray-400 truncate hidden sm:block">{artist.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-gray-500 text-sm">{artist.category}</td>
                      <td className="table-cell text-gray-500 text-sm hidden md:table-cell">{artist.location}</td>
                      <td className="table-cell text-gray-700 hidden md:table-cell">{artist.bookings}</td>
                      <td className="table-cell">
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-medium text-gray-700 text-sm">{artist.rating}</span>
                        </span>
                      </td>
                      <td className="table-cell"><StatusBadge status={artist.status} /></td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 md:gap-2">
                          {artist.status !== 'verified' && (
                            <button 
                              onClick={() => handleVerify(artist, 'approved')} 
                              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                              title="Approve Artist"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          
                          {artist.status !== 'suspended' && (
                            <button 
                              onClick={() => handleVerify(artist, 'rejected')} 
                              className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50"
                              title="Reject Artist"
                            >
                              <X size={16} />
                            </button>
                          )}

                          <button 
                            onClick={() => { setSelectedArtist(artist); setModal('delete'); }} 
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete Artist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 text-xs text-gray-400">
            Showing {filtered.length} of {allArtists.length} artists
          </div>
        )}
      </div>

      {modal && modalConfig[modal] && (
        <ConfirmModal 
          open={true} 
          {...modalConfig[modal]} 
          onCancel={() => { setModal(null); setSelectedArtist(null); }} 
        />
      )}
    </div>
  )
}
