import { type ElementType } from 'react';

type ChurchNameVariant = 'default' | 'csidot';

const LABELS: Record<ChurchNameVariant, string> = {
  default: "All Saints' CSI Church",
  csidot: "All Saints' C.S.I. Church",
};

interface ChurchNameProps {
  /** 'default' = "All Saints' CSI Church", 'csidot' = "All Saints' C.S.I. Church" */
  variant?: ChurchNameVariant;
  className?: string;
  /** Render as this element (default: span) */
  as?: ElementType;
}

/** Renders the church name with the shared church font; color inherits from parent. Add class "church-title" for 48px. */
const ChurchName = ({ variant = 'default', className = '', as: Component = 'span' }: ChurchNameProps) => (
  <Component className={`font-old-english tracking-wide text-inherit ${className}`.trim()}>
    {LABELS[variant]}
  </Component>
);

export default ChurchName;
