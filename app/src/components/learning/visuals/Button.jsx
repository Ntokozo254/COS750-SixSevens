export function Button({ className = "", size: _size, ...props }) { // eslint-disable-line no-unused-vars
  return (
    <button
      type="button"
      className={`inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-3 text-sm font-medium transition-colors disabled:pointer-events-none ${className}`}
      {...props}
    />
  )
}

export default Button