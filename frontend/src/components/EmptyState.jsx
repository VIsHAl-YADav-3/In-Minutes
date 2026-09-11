const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-900/10 bg-white px-6 py-16 text-center animate-fadeUp">
    {Icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <Icon className="h-8 w-8 text-brand-500" strokeWidth={1.5} />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-ink-900/60">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
