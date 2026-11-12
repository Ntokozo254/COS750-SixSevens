
export default function HashSlot({
  index,
  value,
  highlighted,
  collision,
  current
}) {
  const classNames = [
    "hash-slot",
    highlighted ? "highlighted" : "",
    collision ? "collision" : "",
    current ? "current" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <span className="hash-slot-index">{index}</span>

      <strong className="hash-slot-value">
        {value === null || value === undefined ? "Empty" : value}
      </strong>
    </div>
  );
}
