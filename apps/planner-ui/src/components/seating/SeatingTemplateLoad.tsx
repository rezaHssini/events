import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { type SeatingPlan, formatPlanSummary, planFromTemplate } from '../../types/seating'
import { useSeatingTemplates } from '../../context/SeatingTemplatesContext'
import { useToast } from '../../context/ToastContext'
import { BottomSheet } from '../ui/BottomSheet'

export function SeatingTemplateLoad({ onLoad }: { onLoad: (plan: SeatingPlan) => void }) {
  const { templates } = useSeatingTemplates()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    onLoad(planFromTemplate(template))
    setOpen(false)
    toast(`✓ Loaded “${template.name}”`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[16px] liquid-glass-subtle py-3 text-sm font-semibold"
      >
        <FolderOpen className="h-4 w-4" />
        Load template
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Load seating template">
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className="flex w-full items-center justify-between rounded-[16px] liquid-glass-subtle px-4 py-3 text-left"
            >
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="ios-caption">{formatPlanSummary(template.plan)}</p>
              </div>
              <span className="text-sm font-semibold text-[#0a84ff]">Use</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}
