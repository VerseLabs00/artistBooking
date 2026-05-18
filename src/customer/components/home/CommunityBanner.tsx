export default function CommunityBanner() {
  return (
    <section className="bg-red-50 rounded-2xl px-12 py-10 my-8 flex items-center gap-16">
      {/* Left */}
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
          Become part of our<br />musician community.
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor amet, consectetur Lorem ipsum
          dolor sit amet, consectetur Lorem ipsum
        </p>
      </div>

      {/* Right */}
      <div className="flex-1">
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="Enter email address"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-400 bg-white"
          />
          <button className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            Register
          </button>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur Lorem
          ipsum dolor sit amet, consectetur{' '}
          <span className="text-red-600 cursor-pointer hover:underline">Privacy and rules</span>
        </p>
      </div>
    </section>
  )
}
