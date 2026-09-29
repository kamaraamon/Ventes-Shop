import { splitFcfa, type GroupingMode } from "@vpct/config";

export function Money({
  value,
  mode = "narrow",
  className = "",
  inline = false,
}: {
  value: number;
  mode?: GroupingMode;
  className?: string;
  inline?: boolean;
}) {
  const { amount } = splitFcfa(value, mode);
  return (
    <span className={`money ${inline ? "money-inline" : ""} ${className}`}>
      {amount}
      <span className="money-currency">FCFA</span>
    </span>
  );
}
