import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useState } from 'react'
import {
  updateCommissionRate,
  updateDepositRate,
  updateFeaturedPrice,
  toggleAutoApprove,
  toggleMaintenance,
  toggleNotifications,
} from '../features/settings/settingsSlice'
import PageHeader from '../components/common/PageHeader'

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
  const [depositInput, setDepositInput] = useState(settings.depositRate)
  const [featuredInput, setFeaturedInput] = useState(settings.featuredListingPrice)

  const saveFinance = () => {
    dispatch(updateCommissionRate(Number(commissionInput)))
    dispatch(updateDepositRate(Number(depositInput)))
    dispatch(updateFeaturedPrice(Number(featuredInput)))
    toast.success('Finance settings saved!')
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure platform-wide settings and rules."
      />

      {/* Finance Settings */}
      <SettingsSection title="💰 Finance & Commission">
        <SettingsRow
          label="Platform Commission Rate"
          subtitle="Percentage taken from each booking payment"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={commissionInput}
              onChange={e => setCommissionInput(e.target.value)}
              min={1}
              max={50}
              className="w-20 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:border-primary"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>
        </SettingsRow>
        <SettingsRow
          label="Deposit Rate"
          subtitle="Percentage customers pay upfront to confirm booking"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={depositInput}
              onChange={e => setDepositInput(e.target.value)}
              min={10}
              max={100}
              className="w-20 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:border-primary"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>
        </SettingsRow>
        <SettingsRow
          label="Featured Listing Price"
          subtitle="Amount artists pay to be featured (LKR)"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">LKR</span>
            <input
              type="number"
              value={featuredInput}
              onChange={e => setFeaturedInput(e.target.value)}
              className="w-28 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:border-primary"
            />
          </div>
        </SettingsRow>
        <div className="pt-2">
          <button onClick={saveFinance} className="btn-primary">
            Save Finance Settings
          </button>
        </div>
      </SettingsSection>

      {/* Platform Controls */}
      <SettingsSection title="⚙️ Platform Controls">
        <SettingsRow
          label="Auto-Approve Artists"
          subtitle="Skip manual verification for new artists"
        >
          <ToggleSwitch
            enabled={settings.autoApproveEnabled}
            onToggle={() => {
              dispatch(toggleAutoApprove())
              toast.success('Auto-approve updated')
            }}
          />
        </SettingsRow>
        <SettingsRow
          label="Maintenance Mode"
          subtitle="Temporarily disable the app for users"
        >
          <ToggleSwitch
            enabled={settings.maintenanceMode}
            onToggle={() => {
              dispatch(toggleMaintenance())
              toast(settings.maintenanceMode ? 'Maintenance mode OFF' : '⚠️ Maintenance mode ON')
            }}
          />
        </SettingsRow>
        <SettingsRow
          label="Push Notifications"
          subtitle="Send booking reminders to customers and artists"
        >
          <ToggleSwitch
            enabled={settings.notificationsEnabled}
            onToggle={() => {
              dispatch(toggleNotifications())
              toast.success('Notification setting updated')
            }}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Current settings summary */}
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
