import { useState } from 'react'
import { Plus, Trash2, BookmarkPlus, FolderOpen, ImagePlus } from 'lucide-react'
import {
  type EventMenuConfig,
  type EventMenuItem,
  configFromTemplate,
  createMenuItem,
  createMenuTab,
  itemImages,
  itemsForTab,
  menuTabsWithCounts,
} from '../../types/menu'
import { useMenuTemplates } from '../../context/MenuTemplatesContext'
import { useToast } from '../../context/ToastContext'
import {
  FormSection,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormToggle,
} from '../ui/FormPrimitives'
import { BottomSheet } from '../ui/BottomSheet'
import { ImagePickerSheet } from '../ui/StoryComposer'
import { menuTypes } from '../../data/mockData'
import { media } from '../../data/media'

const MENU_IMAGE_OPTIONS = [
  media.cocktail,
  media.beer,
  media.fries,
  media.food,
  media.drink,
  media.concert,
  media.memory1,
  media.memory2,
]

export function EventMenuBuilder({
  menu,
  onChange,
}: {
  menu: EventMenuConfig
  onChange: (menu: EventMenuConfig) => void
}) {
  const { toast } = useToast()
  const { templates, saveTemplate } = useMenuTemplates()
  const [activeTabId, setActiveTabId] = useState(menu.tabs[0]?.id ?? '')
  const [templateSheetOpen, setTemplateSheetOpen] = useState(false)
  const [saveSheetOpen, setSaveSheetOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [imagePickerItemId, setImagePickerItemId] = useState<string | null>(null)

  const activeTab = menu.tabs.find((t) => t.id === activeTabId) ?? menu.tabs[0]
  const tabItems = activeTab ? itemsForTab(menu, activeTab.id) : []

  const update = (patch: Partial<EventMenuConfig>) => onChange({ ...menu, ...patch })

  const updateItem = (id: string, patch: Partial<EventMenuItem>) => {
    onChange({
      ...menu,
      items: menu.items.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, ...patch }
        const images = patch.images ?? itemImages(next)
        return { ...next, images, image: images[0] }
      }),
    })
  }

  const addItemImage = (itemId: string, src: string) => {
    const item = menu.items.find((i) => i.id === itemId)
    if (!item) return
    const images = [...itemImages(item), src]
    updateItem(itemId, { images })
  }

  const removeItemImage = (itemId: string, index: number) => {
    const item = menu.items.find((i) => i.id === itemId)
    if (!item) return
    const images = itemImages(item).filter((_, i) => i !== index)
    updateItem(itemId, { images: images.length ? images : [media.food] })
  }

  const removeItem = (id: string) => {
    onChange({ ...menu, items: menu.items.filter((item) => item.id !== id) })
  }

  const addItem = () => {
    if (!activeTab) return
    const item = createMenuItem(activeTab.id)
    onChange({ ...menu, items: [...menu.items, item] })
  }

  const addTab = () => {
    const tab = createMenuTab(menu.tabs.length)
    onChange({ ...menu, tabs: [...menu.tabs, tab], items: menu.items })
    setActiveTabId(tab.id)
  }

  const removeTab = (tabId: string) => {
    if (menu.tabs.length <= 1) return
    const tabs = menu.tabs.filter((t) => t.id !== tabId)
    onChange({
      ...menu,
      tabs,
      items: menu.items.filter((i) => i.tabId !== tabId),
    })
    if (activeTabId === tabId) setActiveTabId(tabs[0].id)
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    const next = configFromTemplate(template)
    onChange({ ...menu, ...next, enabled: menu.enabled, preorderEnabled: menu.preorderEnabled })
    setActiveTabId(next.tabs[0]?.id ?? '')
    setTemplateSheetOpen(false)
    toast(`✓ Loaded “${template.name}”`)
  }

  const handleSaveTemplate = () => {
    const name = templateName.trim() || 'My menu'
    saveTemplate(name, menu)
    setSaveSheetOpen(false)
    setTemplateName('')
    toast(`✓ Saved “${name}” as template`)
  }

  return (
    <FormSection
      title="Food & drink menu"
      subtitle="Organize items by category tabs. Save menus to reuse on future events."
    >
      <FormToggle
        label="Enable event menu"
        checked={menu.enabled}
        onChange={(enabled) => update({ enabled })}
      />

      {menu.enabled && (
        <>
          <FormField label="Venue menu style">
            <FormSelect
              value={menu.menuType}
              onChange={(menuType) => update({ menuType })}
              options={menuTypes.filter((m) => m !== 'None')}
            />
          </FormField>

          <FormToggle
            label="Allow pre-orders"
            checked={menu.preorderEnabled}
            onChange={(preorderEnabled) => update({ preorderEnabled })}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTemplateSheetOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] liquid-glass-subtle py-3 text-sm font-semibold"
            >
              <FolderOpen className="h-4 w-4" />
              Load template
            </button>
            <button
              type="button"
              onClick={() => setSaveSheetOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#0a84ff]/20 py-3 text-sm font-semibold text-[#64b5ff]"
            >
              <BookmarkPlus className="h-4 w-4" />
              Save template
            </button>
          </div>

          <div className="rounded-[18px] liquid-glass-subtle p-3">
            <p className="mb-2 px-1 ios-caption">Menu tabs</p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {menuTabsWithCounts(menu).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    tab.id === activeTab?.id ? 'bg-[#0a84ff] text-white' : 'bg-white/8 text-white/55'
                  }`}
                >
                  {tab.emoji} {tab.name}
                  <span className="ml-1 opacity-70">({tab.count})</span>
                </button>
              ))}
              <button
                type="button"
                onClick={addTab}
                className="flex shrink-0 items-center gap-1 rounded-full bg-white/8 px-2.5 py-1.5 text-xs font-medium text-white/55"
              >
                <Plus className="h-3.5 w-3.5" />
                Tab
              </button>
            </div>

            {activeTab && (
              <div className="mt-3 flex items-center gap-2">
                <FormInput
                  value={activeTab.emoji}
                  onChange={(e) =>
                    onChange({
                      ...menu,
                      tabs: menu.tabs.map((t) =>
                        t.id === activeTab.id ? { ...t, emoji: e.target.value } : t,
                      ),
                    })
                  }
                  className="!w-14 text-center"
                  maxLength={2}
                />
                <FormInput
                  value={activeTab.name}
                  onChange={(e) =>
                    onChange({
                      ...menu,
                      tabs: menu.tabs.map((t) =>
                        t.id === activeTab.id ? { ...t, name: e.target.value } : t,
                      ),
                    })
                  }
                  className="flex-1"
                />
                {menu.tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTab(activeTab.id)}
                    className="rounded-full p-2 text-[#ff453a]"
                    aria-label="Remove tab"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="px-1 ios-caption">
              Items in {activeTab?.name ?? 'tab'}
            </p>
            {tabItems.length === 0 && (
              <p className="rounded-[16px] liquid-glass-subtle py-8 text-center ios-caption">
                No items in this tab yet
              </p>
            )}
            {tabItems.map((item) => {
              const images = itemImages(item)
              return (
              <div key={item.id} className="rounded-[18px] liquid-glass p-4 text-left">
                <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((src, i) => (
                    <div key={`${src}-${i}`} className="relative shrink-0">
                      <img src={src} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemImage(item.id, i)}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff453a] text-[10px] text-white"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setImagePickerItemId(item.id)}
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/20 text-white/40"
                  >
                    <ImagePlus className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <FormInput
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    className="font-semibold"
                  />
                  <FormInput
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Short description"
                  />
                  <FormTextarea
                    value={item.longDescription ?? ''}
                    onChange={(e) => updateItem(item.id, { longDescription: e.target.value })}
                    placeholder="Full description (shown in item details)"
                    rows={3}
                  />
                  <FormInput
                    value={(item.ingredients ?? []).join(', ')}
                    onChange={(e) =>
                      updateItem(item.id, {
                        ingredients: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Ingredients (comma-separated)"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormInput
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(e) =>
                        updateItem(item.id, { price: Number(e.target.value) || 0 })
                      }
                      placeholder="Price"
                    />
                    <label className="flex items-center gap-2 rounded-[14px] bg-white/8 px-3 text-sm">
                      <input
                        type="checkbox"
                        checked={item.ageRestricted ?? false}
                        onChange={(e) =>
                          updateItem(item.id, { ageRestricted: e.target.checked })
                        }
                      />
                      21+
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff453a]/10 py-2 text-sm text-[#ff453a]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove item
                  </button>
                </div>
              </div>
            )})}

            <button
              type="button"
              onClick={addItem}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-white/20 py-3 text-sm font-medium text-white/50"
            >
              <Plus className="h-4 w-4" />
              Add item to {activeTab?.name}
            </button>
          </div>

          <p className="text-center ios-caption">
            {menu.items.length} items across {menu.tabs.length} tab{menu.tabs.length === 1 ? '' : 's'}
            {menu.preorderEnabled ? ' · Pre-order enabled' : ' · View-only menu at checkout'}
          </p>
        </>
      )}

      <BottomSheet open={templateSheetOpen} onClose={() => setTemplateSheetOpen(false)} title="Load menu template">
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
                <p className="ios-caption">
                  {template.menuType} · {template.items.length} items · {template.tabs.length} tabs
                </p>
              </div>
              <span className="text-[#0a84ff] text-sm font-semibold">Use</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={saveSheetOpen} onClose={() => setSaveSheetOpen(false)} title="Save as template">
        <div className="space-y-4 text-left">
          <label className="block text-sm">
            Template name
            <FormInput
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Summer bar menu"
              className="mt-1.5"
            />
          </label>
          <button type="button" onClick={handleSaveTemplate} className="ios-button w-full py-3.5">
            Save template
          </button>
        </div>
      </BottomSheet>

      <ImagePickerSheet
        open={!!imagePickerItemId}
        onClose={() => setImagePickerItemId(null)}
        title="Add menu photo"
        options={MENU_IMAGE_OPTIONS}
        onSelect={(src) => {
          if (imagePickerItemId) addItemImage(imagePickerItemId, src)
        }}
      />
    </FormSection>
  )
}
