export default function Button({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      className={`
        bg-black text-white
        dark:bg-white dark:text-black

        rounded-2xl
        px-6 py-4
        font-semibold

        hover:opacity-90
        transition
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}