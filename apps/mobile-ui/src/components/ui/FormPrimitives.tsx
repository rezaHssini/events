import { motion } from 'framer-motion'

export function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="ios-headline">{title}</h2>
        {subtitle && <p className="mt-1 ios-caption">{subtitle}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] liquid-glass-subtle p-4 text-left">
      <label className="ios-caption mb-2 block !text-[rgba(235,235,245,0.55)]">{label}</label>
      {children}
      {hint && <p className="mt-2 ios-caption">{hint}</p>}
    </div>
  )
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-[14px] bg-white/10 px-4 py-3 text-[15px] outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#0a84ff]/40 ${props.className ?? ''}`}
    />
  )
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-[14px] bg-white/10 px-4 py-3 text-[15px] outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#0a84ff]/40 ${props.className ?? ''}`}
    />
  )
}

export function FormSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[14px] bg-white/10 px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0a84ff]/40"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#1c1c1e]">
          {o}
        </option>
      ))}
    </select>
  )
}

export function FormChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        selected ? 'bg-[#0a84ff] text-white' : 'liquid-glass-subtle'
      }`}
    >
      {label}
    </button>
  )
}

export function FormToggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-[18px] liquid-glass-subtle p-4 text-left"
    >
      <div className="min-w-0">
        <p className="text-[15px] font-medium">{label}</p>
        {desc && <p className="mt-0.5 ios-caption">{desc}</p>}
      </div>
      <div className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#0a84ff]' : 'bg-white/15'}`}>
        <motion.div
          layout
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${checked ? 'left-6' : 'left-1'}`}
        />
      </div>
    </button>
  )
}
