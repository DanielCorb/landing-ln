/**
 * Compose a Tailwind class string from a static base plus dynamic parts.
 *
 * Prefer this over inlining ternaries into `className` so conditional styling stays
 * readable and greppable.
 *
 *   getClassNames('rounded-md px-4 py-2', { 'bg-teal text-white': isPrimary })
 *   getClassNames('p-2', isActive ? 'text-teal' : 'text-text-muted')
 */
export const getClassNames = (
  base: string,
  variant?: string | false | null | Record<string, boolean>,
): string => {
  if (!variant) return base;
  if (typeof variant === 'string') return `${base} ${variant}`;

  const active = Object.entries(variant)
    .filter(([, isOn]) => isOn)
    .map(([className]) => className);

  return [base, ...active].join(' ');
};
