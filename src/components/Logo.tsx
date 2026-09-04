interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = {
    sm: { container: 'text-lg', icon: 'w-7 h-7', text: 'text-base' },
    md: { container: 'text-xl', icon: 'w-10 h-10', text: 'text-xl' },
    lg: { container: 'text-2xl', icon: 'w-14 h-14', text: 'text-2xl' },
    xl: { container: 'text-3xl', icon: 'w-20 h-20', text: 'text-3xl' },
  };

  const textColor = variant === 'dark' ? 'text-cream-50' : 'text-charcoal-900';
  const subColor = variant === 'dark' ? 'text-cream-300' : 'text-charcoal-500';

  // For larger sizes use the full sign SVG; for small sizes use a compact mark
  if (size === 'lg' || size === 'xl') {
    return (
      <div className={`flex items-center gap-2 ${sizes[size].container}`}>
        <img
          src="/images/bhukkad-sign.svg"
          alt="Bhukkad Cafe sign"
          className="brand-sign"
          style={{ height: size === 'xl' ? 80 : 56 }}
        />
      </div>
    );
  }
  // For small/medium sizes render the compact logo image
  return (
    <div className={`flex items-center gap-2 ${sizes[size].container}`}>
      <img
        src="/images/logo.png"
        alt="Bhukkad Cafe"
        className={`rounded-full object-contain ${sizes[size].icon}`}
        style={{ width: sizes[size].icon.split(' ')[0]?.replace('w-', '') ? undefined : undefined }}
      />
      <div className="flex flex-col leading-none">
        <span className={`font-heading font-bold ${sizes[size].text} ${textColor} tracking-tight`}>
          Bhukkad
        </span>
        <span className={`font-heading font-medium text-sm ${subColor} tracking-widest uppercase`} style={{ fontSize: '45%' }}>
          Cafe
        </span>
      </div>
    </div>
  );
}
