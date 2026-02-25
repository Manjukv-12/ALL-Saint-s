import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'hero';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  asLink?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const ChurchButton = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  asLink = false,
  href = '',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: ButtonProps) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-sans font-semibold
    rounded-full transition-all duration-300 ease-smooth
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
    no-underline hover:no-underline
  `;

  const variants = {
    primary: `
      bg-primary text-primary-foreground
      hover:bg-[#e2e6e9] hover:text-[#4b6281] hover:border-[#4b6281] border-2 border-transparent
      hover:shadow-medium focus:ring-primary
    `,
    secondary: `
      bg-secondary text-secondary-foreground
      hover:bg-[#e2e6e9] hover:text-[#4b6281] hover:border-[#4b6281] border-2 border-transparent
      hover:shadow-soft focus:ring-secondary
    `,
    outline: `
      border-2 border-primary text-primary
      hover:bg-[#e2e6e9] hover:text-[#4b6281] hover:border-[#4b6281]
      focus:ring-primary
    `,
    ghost: `
      text-primary hover:bg-[#e2e6e9] hover:text-[#4b6281]
      focus:ring-primary
    `,
    hero: `
      bg-secondary text-secondary-foreground
      hover:bg-[#e2e6e9] hover:text-[#4b6281] hover:border-[#4b6281]
      focus:ring-secondary
      shadow-glow btn-glow
      border border-secondary/50
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {children}
      {icon || (asLink && <ArrowRight size={size === 'lg' ? 20 : 16} />)}
    </>
  );

  if (asLink && href) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link to={href} className={combinedClassName}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {content}
    </motion.button>
  );
};

export default ChurchButton;
