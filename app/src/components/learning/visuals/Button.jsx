export function Button({ className = "", size = "sm", variant = "secondary", ...props }) {
  return (
    <button
      type="button"
      className={`lesson-visual-button lesson-visual-button--${variant} lesson-visual-button--${size} ${className}`}
      {...props}
    />
  )
}

export default Button
