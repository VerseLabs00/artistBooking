import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  CheckCheck,
  X,
  ShoppingBag,
  UserCheck,
  Users,
  Settings,
  AlertCircle,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import {
  markRead,
  markAllRead,
  dismissNotification,
  selectUnreadCount,
} from "../../features/notifications/notificationsSlice";

const pageTitles = {
  "/": "Dashboard",
  "/artists": "Artists",
  "/verification": "Verification",
  "/customers": "Users",
  "/bookings": "Bookings",
  "/settings": "Settings",
};

// Icon + colour per notification type
const typeConfig = {
  verification: {
    icon: <UserCheck size={15} />,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
  },
  booking: {
    icon: <ShoppingBag size={15} />,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  artist: {
    icon: <UserCheck size={15} />,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  customer: {
    icon: <Users size={15} />,
    bg: "bg-red-100",
    color: "text-red-600",
  },
  system: {
    icon: <Settings size={15} />,
    bg: "bg-gray-100",
    color: "text-gray-500",
  },
};

function NotificationItem({ notification, onRead, onDismiss, onNavigate }) {
  const cfg = typeConfig[notification.type] || typeConfig.system;

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
        !notification.read ? "bg-blue-50/40" : ""
      }`}
      onClick={() => {
        onRead(notification.id);
        onNavigate(notification.link);
      }}
    >
      {/* Type icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className={`text-sm leading-snug ${!notification.read ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 leading-snug">
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">
          {notification.time}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={11} />
      </button>
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const title = pageTitles[location.pathname] || "Dashboard";

  const notifications = useSelector((s) => s.notifications.list);
  const unreadCount = useSelector(selectUnreadCount);

  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | unread

  const bellRef = useRef(null);
  const dropRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (
        dropRef.current &&
        !dropRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayed =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleNavigate = (link) => {
    setNotifOpen(false);
    navigate(link);
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[280px] h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-8 z-10">
      {/* Left — hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Right — search + bell */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2 w-48 lg:w-72">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 w-full"
          />
        </div>

        {/* Bell button */}
        <button
          ref={bellRef}
          onClick={() => setNotifOpen((o) => !o)}
          className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
            notifOpen
              ? "bg-primary border-primary text-white"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary border-2 border-white rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* ── Notification Dropdown ── */}
        {notifOpen && (
          <div
            ref={dropRef}
            className="absolute top-[68px] right-4 md:right-6 lg:right-8 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-400">{unreadCount} unread</p>
                )}
              </div>
              <button
                onClick={() => dispatch(markAllRead())}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { key: "all", label: "All", count: notifications.length },
                { key: "unread", label: "Unread", count: unreadCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === tab.key
                      ? "text-gray-900 border-b-2 border-primary"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === tab.key
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {displayed.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell size={20} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="group">
                  {displayed.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={(id) => dispatch(markRead(id))}
                      onDismiss={(id) => dispatch(dismissNotification(id))}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-3 text-center">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
