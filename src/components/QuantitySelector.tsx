import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';
}

export default function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  size = 'md',
}: QuantitySelectorProps) {
  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="inline-flex items-center gap-1 bg-charcoal-700 rounded-full p-1 select-none">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        className={`${btnSize} rounded-full bg-charcoal-600 hover:bg-cream-400 hover:text-charcoal-900 text-cream-200 flex items-center justify-center transition-all duration-200 active:scale-90`}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} strokeWidth={2.5} />
      </button>
      <span className={`font-heading font-bold ${textSize} text-cream-50 min-w-[1.5rem] text-center tabular-nums`}>
        {quantity}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        className={`${btnSize} rounded-full bg-cream-400 hover:bg-cream-300 text-charcoal-900 flex items-center justify-center transition-all duration-200 active:scale-90`}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
}
