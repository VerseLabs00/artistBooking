import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import {
  updateCommissionRate,
  updateFeaturedPrice,
  toggleMaintenance,
  setMaintenanceMode,
  toggleNotifications,
} from '../features/settings/settingsSlice'
import PageHeader from '../components/common/PageHeader'
import { settingsApi } from '../api/settingsApi'

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function SettingsSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SettingsRow({ label, subtitle, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function Settings() {
  const dispatch = useDispatch()
  const settings = useSelector(s => s.settings)

  const [commissionInput, setCommissionInput] = useState(settings.commissionRate)
  const [featuredInput, setFeaturedInput] = useState(settings.featuredListingPrice)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getSettings()
      setCommissionInput(data.commission_rate)
      setFeaturedInput(data.featured_listing_price)
      dispatch(updateCommissionRate(data.commission_rate))
      dispatch(updateFeaturedPrice(data.featured_listing_price))
      dispatch(setMaintenanceMode(data.maintenance_mode))
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const saveFinance = async () => {
    setLoading(true)
    try {
      await settingsApi.updateSettings({
        commission_rate: Number(commissionInput),
        featured_listing_price: Number(featuredInput)
      })
      dispatch(updateCommissionRate(Number(commissionInput)))
      dispatch(updateFeaturedPrice(Number(featuredInput)))
      toast.success('Finance settings saved!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Configure platform-wide settings and rules." />
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <div className="h-5 bg-gray-100 rounded w-40 animate-pulse mb-4" />
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <div className="h-4 bg-gray-100 rounded w-48 animate-pulse mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                  </div>
                  <div className="h-8 bg-gray-100 rounded w-28 animate-pulse" />
                </div>
              ))}
              <div className="h-10 bg-gray-100 rounded w-40 animate-pulse mt-4" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <div className="h-5 bg-gray-100 rounded w-40 animate-pulse mb-4" />
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <div className="h-4 bg-gray-100 rounded w-48 animate-pulse mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                  </div>
                  <div className="w-11 h-6 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure platform-wide settings and rules." />

      <SettingsSection title="Finance & Commission">
        <SettingsRow label="Platform Commission Rate" subtitle="Percentage taken from each booking payment">
          <div className="flex items-center gap-2">
            <input type="number" value={commissionInput} onChange={e => setCommissionInput(e.target.value)} min={1} max={50} className="w-20 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:border-primary" />
            <span className="text-sm text-gray-400">%</span>
          </div>
        </SettingsRow>
        <SettingsRow label="Featured Listing Price" subtitle="Amount artists pay to be featured (LKR)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">LKR</span>
            <input type="number" value={featuredInput} onChange={e => setFeaturedInput(e.target.value)} className="w-28 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:border-primary" />
          </div>
        </SettingsRow>
        <div className="pt-2">
          <button onClick={saveFinance} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Finance Settings'}
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Platform Controls">
        <SettingsRow label="Maintenance Mode" subtitle="Temporarily disable the app for users">
          <ToggleSwitch enabled={settings.maintenanceMode} onToggle={async () => {
            const newValue = !settings.maintenanceMode
            try {
              await settingsApi.updateSettings({ maintenance_mode: newValue })
              dispatch(toggleMaintenance())
              toast(newValue ? 'Maintenance mode ON' : 'Maintenance mode OFF')
            } catch {
              toast.error('Failed to update maintenance mode')
            }
          }} />
        </SettingsRow>
        <div style={{ filter: 'blur(2px)', opacity: 0.5, pointerEvents: 'none' }}>
          <SettingsRow label="Push Notifications" subtitle="Send booking reminders to customers and artists">
            <ToggleSwitch enabled={settings.notificationsEnabled} onToggle={() => {
              dispatch(toggleNotifications())
              toast.success('Notification setting updated')
            }} />
          </SettingsRow>
        </div>
        <p className="text-xs text-gray-400 mt-1">Push Notifications — Coming soon</p>
      </SettingsSection>

      <div className="bg-gray-900 text-white rounded-2xl p-6">
        <h3 className="text-sm font-bold mb-4 text-gray-300">Current Settings Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400">Commission</p>
            <p className="text-2xl font-extrabold">{settings.commissionRate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Deposit Rate</p>
            <p className="text-2xl font-extrabold">{settings.depositRate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Featured Price</p>
            <p className="text-2xl font-extrabold">LKR {settings.featuredListingPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
