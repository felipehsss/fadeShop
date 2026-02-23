interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{
        width: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
        height: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
      }}
      aria-label="Carregando"
    />
  );
}
