export function DecorativeBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden bg-premium-radial">
      <div className="paper-texture absolute inset-0 opacity-75" />
      <div className="decor-grain absolute inset-0 opacity-20 sm:opacity-25" />
      <div className="absolute -left-28 top-10 h-56 w-56 rounded-full bg-blush/70 blur-3xl sm:top-20 sm:h-72 sm:w-72" />
      <div className="absolute -right-28 top-6 h-60 w-60 rounded-full bg-shell/25 blur-3xl sm:-right-24 sm:top-10 sm:h-80 sm:w-80" />
      <div className="absolute bottom-[-8rem] left-1/2 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-rose/10 blur-3xl sm:bottom-[-10rem] sm:h-[28rem] sm:w-[28rem]" />
      <svg className="absolute right-[-5rem] top-20 hidden h-72 w-72 opacity-[.10] sm:block lg:right-[-3rem] lg:h-80 lg:w-80 lg:opacity-[.13]" viewBox="0 0 260 260" fill="none">
        <path d="M58 182c69-20 119-72 135-139 15 71-17 142-82 176-21 11-43 16-67 16 22-11 36-28 14-53Z" fill="#B96F68" />
        <path d="M52 126c42-19 70-52 83-99 10 55-10 98-57 129-19 12-39 19-62 22 19-16 28-30 36-52Z" fill="#D8A56E" />
      </svg>
      <svg className="absolute -left-20 bottom-12 hidden h-64 w-64 rotate-12 opacity-[.08] sm:block lg:-left-10 lg:bottom-16 lg:h-72 lg:w-72 lg:opacity-[.11]" viewBox="0 0 260 260" fill="none">
        <path d="M189 65c-44 11-77 37-99 79-18 34-24 68-18 102 18-28 37-47 61-58 46-23 72-63 56-123Z" fill="#B96F68" />
        <path d="M80 51c24 41 26 82 5 124-12 25-30 45-54 59 55 1 98-21 128-65 31-46 5-100-79-118Z" fill="#D8A56E" />
      </svg>
    </div>
  );
}
