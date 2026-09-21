export default function ErpStatusBadge({ value }: { value: unknown }) {
  return <span className="status-badge">{String(value ?? '-')}</span>;
}
