export default function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={active === tab.value ? 'filter-btn-active' : 'filter-btn'}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
