
import HashSlot from "./HashSlot";

export default function HashTable({
  table,
  highlightedIndex = null,
  collisionIndex = null,
  currentIndex = null
}) {
  return (
    <div className="hash-table">
      {table.map((value, index) => (
        <HashSlot
          key={index}
          index={index}
          value={value}
          highlighted={highlightedIndex === index}
          collision={collisionIndex === index}
          current={currentIndex === index}
        />
      ))}
    </div>
  );
}
