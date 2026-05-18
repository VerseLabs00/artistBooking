export default function SocialLogins() {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-sm text-gray-400">or login with</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Icons */}
      <div className="flex items-center justify-center gap-4">
        {/* Facebook */}
        <button className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#1877F2" />
            <path d="M16.5 12H14V10.5C14 9.948 14.448 9.5 15 9.5H16V7.5H14.5C12.843 7.5 11.5 8.843 11.5 10.5V12H10V14H11.5V19H14V14H15.5L16.5 12Z" fill="white" />
          </svg>
        </button>

        {/* Google */}
        <button className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
          <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </button>

        {/* Apple */}
        <button className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.24.74 3.01.8.92-.19 1.81-.87 3-.93 1.44-.07 2.78.57 3.65 1.64-3.23 2.02-2.7 6.25.54 7.55-.62 1.64-1.44 3.26-2.2 3.82zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        </button>
      </div>
    </>
  )
}
