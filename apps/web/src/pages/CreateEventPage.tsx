import { media } from '../data/media'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Badge } from '../components/UI'
import { WebClubHeader } from '../components/club/WebClubHeader'
import { usePlanner } from '../context/PlannerContext'
import { useToast } from '../context/ToastContext'
import { ImagePickerSheet, VideoPickerSheet } from '../components/ui/StoryComposer'
import { SeatingStudio } from '../components/ui/SeatingStudio'
import { EventMap } from '../components/ui/EventMap'
import {
  FormSection,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormChip,
  FormToggle,
} from '../components/ui/FormPrimitives'
import { geocodeAddress } from '../utils/geocode'
import { type SeatingPlan, planStats, formatPlanSummary } from '../types/seating'
import { type TicketDraft, DEFAULT_TICKETS } from '../types/tickets'
import { SeatingTemplateLoad } from '../components/seating/SeatingTemplateLoad'
import { type EventRecurrence, defaultRecurrence, formatRecurrence, isRecurring } from '../types/recurrence'
import { RecurrencePicker } from '../components/ui/RecurrencePicker'
import { EventMenuBuilder } from '../components/menu/EventMenuBuilder'
import { createDefaultEventMenu, menuItemCount, type EventMenuConfig } from '../types/menu'
import { useMenuTemplates } from '../context/MenuTemplatesContext'
import {
  categories,
  visibilityOptions,
  ageOptions,
  formatOptions,
} from '../data/mockData'

const STEPS = [
  'Basics',
  'When & Where',
  'Tickets',
  'Menu',
  'Perks',
  'Media',
  'Settings',
  'Publish',
] as const

const Field = FormField
const Input = FormInput

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { addManagedEvent, isPlanner } = usePlanner()
  const { toast } = useToast()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [step, setStep] = useState(0)
  const [done, setDone] = useState<'draft' | 'scheduled' | 'published' | null>(null)

  const [title, setTitle] = useState('Neon Nights: Fall Edition')
  const [description, setDescription] = useState(
    'An immersive electronic night with top DJs, laser shows, and rooftop terrace.',
  )
  const [category, setCategory] = useState('Music')
  const [tags, setTags] = useState('techno, warehouse, 21+')
  const [coverUrl, setCoverUrl] = useState<string>(media.concert)
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [showSeatingStudio, setShowSeatingStudio] = useState(false)
  const [seatingPlan, setSeatingPlan] = useState<SeatingPlan | null>(null)

  const [startDate, setStartDate] = useState('2026-10-18')
  const [startTime, setStartTime] = useState('21:00')
  const [endDate, setEndDate] = useState('2026-10-19')
  const [endTime, setEndTime] = useState('03:00')
  const [timezone, setTimezone] = useState('America/Los_Angeles')
  const [venue, setVenue] = useState('The Warehouse')
  const [address, setAddress] = useState('42 Industrial Ave, Los Angeles, CA')
  const [recurrence, setRecurrence] = useState<EventRecurrence>(defaultRecurrence())

  const [format, setFormat] = useState<(typeof formatOptions)[number]>('Standing (GA)')
  const [capacity, setCapacity] = useState('800')
  const [tickets, setTickets] = useState<TicketDraft[]>(DEFAULT_TICKETS)
  const [isFree, setIsFree] = useState(false)

  const { setDraftMenu } = useMenuTemplates()
  const [menuConfig, setMenuConfig] = useState<EventMenuConfig>(createDefaultEventMenu)

  const [perksEnabled, setPerksEnabled] = useState(true)
  const [redemptionWindow, setRedemptionWindow] = useState('First 2 hours')

  const [galleryImages, setGalleryImages] = useState<string[]>([media.concert, media.memory1, media.memory2])
  const [promoVideos, setPromoVideos] = useState<string[]>([])
  const [externalVideoUrl, setExternalVideoUrl] = useState('')
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const [showVideoPicker, setShowVideoPicker] = useState(false)
  const [lineup, setLineup] = useState(['DJ Aurora', 'Neon Pulse', 'Echo Chamber'])

  const [registrationQuestions, setRegistrationQuestions] = useState<string[]>(['Dietary restrictions?'])

  const [visibility, setVisibility] = useState('Public')
  const [ageRestriction, setAgeRestriction] = useState('21+')
  const [reservationRequired, setReservationRequired] = useState(true)
  const [memoriesEnabled, setMemoriesEnabled] = useState(true)
  const [refundPolicy, setRefundPolicy] = useState('Full refund up to 48h before event')

  const [publishMode, setPublishMode] = useState<'draft' | 'now' | 'schedule'>('schedule')
  const [scheduleDate, setScheduleDate] = useState('2026-07-12')
  const [scheduleTime, setScheduleTime] = useState('10:00')

  const progress = ((step + 1) / STEPS.length) * 100

  const handleMenuChange = (next: EventMenuConfig) => {
    setMenuConfig(next)
    setDraftMenu(next)
  }

  const togglePerk = (ticketIndex: number, perk: string) => {
    setTickets((prev) => {
      const next = [...prev]
      const t = next[ticketIndex]
      const perks = t.perks.includes(perk) ? t.perks.filter((p) => p !== perk) : [...t.perks, perk]
      next[ticketIndex] = { ...t, perks }
      return next
    })
  }

  const persistEvent = (mode: 'draft' | 'scheduled' | 'published') => {
    if (!isPlanner) {
      toast('Tip: launch your club from Planner to save events to My Club')
      return
    }
    const status = mode === 'draft' ? 'draft' : mode === 'scheduled' ? 'scheduled' : 'live'
    addManagedEvent({
      title,
      cover: coverUrl,
      category,
      location: venue,
      address,
      city: 'Los Angeles',
      date: startDate,
      time: startTime,
      status,
      capacity: Number(seatingPlan ? planStats(seatingPlan).seats : capacity) || 100,
      menuType: menuConfig.enabled ? menuConfig.menuType : 'None',
      menuItemCount: menuItemCount(menuConfig),
      scheduledPublish: mode === 'scheduled' ? `${scheduleDate} ${scheduleTime}` : null,
      recurrence: isRecurring(recurrence) ? recurrence : undefined,
      seriesStart: startDate,
    })
    toast(mode === 'draft' ? '✓ Draft saved to My Club' : '✓ Event created')
  }

  const handleFinish = (mode: 'draft' | 'scheduled' | 'published') => {
    persistEvent(mode)
    setDone(mode)
  }

  if (done) {
    const statusLabel =
      done === 'draft' ? 'Draft' : done === 'scheduled' ? 'Scheduled' : 'Published'
    const statusVariant =
      done === 'draft' ? 'warning' : done === 'scheduled' ? 'primary' : 'success'

    return (
      <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 pb-36 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex h-20 w-20 items-center justify-center rounded-full liquid-glass text-4xl"
          >
            {done === 'draft' ? '📝' : done === 'scheduled' ? '⏰' : '🚀'}
          </motion.div>
          <h2 className="mt-5 text-2xl font-bold">
            {done === 'draft' && 'Saved as draft'}
            {done === 'scheduled' && 'Publish scheduled'}
            {done === 'published' && 'Event published!'}
          </h2>
          <p className="mt-2 max-w-sm ios-caption">
            {done === 'draft' && 'Continue editing anytime from My Club.'}
            {done === 'scheduled' &&
              `Goes live ${scheduleDate} at ${scheduleTime} (${timezone})`}
            {done === 'published' && 'Your event is now visible to attendees.'}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 w-full max-w-sm rounded-[24px] liquid-glass p-4 text-left"
          >
            <img src={coverUrl} alt="" className="aspect-[16/9] w-full rounded-[16px] object-cover" />
            <p className="mt-3 text-lg font-bold">{title}</p>
            <p className="mt-1 ios-caption">
              {startDate} · {venue}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              <Badge>{category}</Badge>
              {menuConfig.enabled && <Badge>Menu</Badge>}
              {perksEnabled && <Badge>Perks</Badge>}
            </div>
          </motion.div>
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-black/80 p-4 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
            <Link to="/planner" className="ios-button w-full py-3.5 text-center text-[17px]">
              Back to My Club
            </Link>
            <button
              type="button"
              onClick={() => navigate('/create-event', { replace: true })}
              className="w-full rounded-[16px] bg-white/10 py-3.5 text-[17px] font-semibold"
            >
              Create another
            </button>
          </div>
        </div>
      </div>
    )
  }

  const applySeatingPlan = (plan: SeatingPlan) => {
    setSeatingPlan(plan)
    const stats = planStats(plan)
    setCapacity(String(stats.seats))
    const nextTickets: TicketDraft[] = []
    for (const floor of plan.floors) {
      if (floor.mode === 'theater') {
        for (const section of floor.sections) {
          const qty = section.seats.filter((s) => !s.blocked).length
          if (qty === 0) continue
          nextTickets.push({
            name: plan.floors.length > 1 ? `${floor.name} · ${section.name}` : section.name,
            price: String(section.price),
            quantity: String(qty),
            perks: [],
          })
        }
      } else {
        for (const table of floor.tables) {
          if (table.blocked) continue
          const qty = table.chairs.filter((c) => !c.blocked).length
          if (qty === 0) continue
          nextTickets.push({
            name: plan.floors.length > 1 ? `${floor.name} · ${table.label}` : table.label,
            price: String(table.pricePerSeat),
            quantity: String(qty),
            perks: [],
          })
        }
      }
    }
    if (nextTickets.length > 0) setTickets(nextTickets)
  }

  const seatingStudio = (
    <SeatingStudio
      open={showSeatingStudio}
      initialPlan={seatingPlan}
      onClose={() => setShowSeatingStudio(false)}
      onSave={applySeatingPlan}
    />
  )

  const footerActions = (
    <div className="flex w-full gap-3">
      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium hover:bg-white/[0.08]"
        >
          Back
        </button>
      )}
      {step < STEPS.length - 1 ? (
        <>
          <button
            type="button"
            onClick={() => handleFinish('draft')}
            className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="min-w-0 flex-1 rounded-xl gradient-hero py-3 text-sm font-bold text-white"
          >
            Continue
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => handleFinish('draft')}
            className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() =>
              handleFinish(publishMode === 'schedule' ? 'scheduled' : publishMode === 'now' ? 'published' : 'draft')
            }
            className="min-w-0 flex-1 rounded-xl gradient-hero py-3 text-sm font-bold text-white"
          >
            {publishMode === 'draft' && 'Save as draft'}
            {publishMode === 'now' && 'Publish now'}
            {publishMode === 'schedule' && 'Schedule publish'}
          </button>
        </>
      )}
    </div>
  )

  if (showSeatingStudio) {
    return seatingStudio
  }

  return (
    <div className="pb-28 lg:pb-10">
      <WebClubHeader
        title="Create Event"
        subtitle={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
      />

      <div className="web-container">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-1">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    i === step
                      ? 'bg-primary/20 font-medium text-primary-light'
                      : i < step
                        ? 'text-slate-300 hover:bg-white/5'
                        : 'text-slate-500 hover:bg-white/5'
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                    {i + 1}
                  </span>
                  {s}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 pb-4 lg:pb-0">
      {/* Progress header — mobile/tablet */}
      <div className="mb-6 border-b border-white/10 pb-4 lg:hidden">
        <div className="liquid-glass rounded-[18px] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="ios-caption">Step {step + 1} of {STEPS.length}</span>
            <span className="ios-headline text-[#0a84ff]">{STEPS[step]}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full gradient-hero"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(i)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  i === step
                    ? 'bg-[#0a84ff] text-white'
                    : i < step
                      ? 'bg-[#0a84ff]/30 text-[#64b5ff]'
                      : 'bg-white/10 text-white/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="pb-6 text-left lg:max-w-3xl"
        >
          {step === 0 && (
            <StepBasics
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              tags={tags}
              setTags={setTags}
              coverUrl={coverUrl}
              onPickCover={() => setShowCoverPicker(true)}
            />
          )}
          {step === 1 && (
            <StepWhenWhere
              startDate={startDate}
              setStartDate={setStartDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endDate={endDate}
              setEndDate={setEndDate}
              endTime={endTime}
              setEndTime={setEndTime}
              timezone={timezone}
              setTimezone={setTimezone}
              venue={venue}
              setVenue={setVenue}
              address={address}
              setAddress={setAddress}
              recurrence={recurrence}
              setRecurrence={setRecurrence}
            />
          )}
          {step === 2 && (
            <StepTickets
              format={format}
              setFormat={setFormat}
              capacity={seatingPlan ? String(planStats(seatingPlan).seats) : capacity}
              setCapacity={setCapacity}
              tickets={tickets}
              setTickets={setTickets}
              isFree={isFree}
              setIsFree={setIsFree}
              seatingPlan={seatingPlan}
              onOpenSeating={() => setShowSeatingStudio(true)}
              onApplySeatingPlan={applySeatingPlan}
            />
          )}
          {step === 3 && (
            <EventMenuBuilder menu={menuConfig} onChange={handleMenuChange} />
          )}
          {step === 4 && (
            <StepPerks
              perksEnabled={perksEnabled}
              setPerksEnabled={setPerksEnabled}
              tickets={tickets}
              togglePerk={togglePerk}
              redemptionWindow={redemptionWindow}
              setRedemptionWindow={setRedemptionWindow}
            />
          )}
          {step === 5 && (
            <StepMedia
              galleryImages={galleryImages}
              onAddGallery={() => setShowGalleryPicker(true)}
              onRemoveGallery={(index) =>
                setGalleryImages((prev) => prev.filter((_, i) => i !== index))
              }
              promoVideos={promoVideos}
              onAddVideo={() => setShowVideoPicker(true)}
              onRemoveVideo={(index) =>
                setPromoVideos((prev) => prev.filter((_, i) => i !== index))
              }
              externalVideoUrl={externalVideoUrl}
              setExternalVideoUrl={setExternalVideoUrl}
              lineup={lineup}
              setLineup={setLineup}
              coverUrl={coverUrl}
            />
          )}
          {step === 6 && (
            <StepSettings
              visibility={visibility}
              setVisibility={setVisibility}
              ageRestriction={ageRestriction}
              setAgeRestriction={setAgeRestriction}
              reservationRequired={reservationRequired}
              setReservationRequired={setReservationRequired}
              memoriesEnabled={memoriesEnabled}
              setMemoriesEnabled={setMemoriesEnabled}
              refundPolicy={refundPolicy}
              setRefundPolicy={setRefundPolicy}
              registrationQuestions={registrationQuestions}
              setRegistrationQuestions={setRegistrationQuestions}
            />
          )}
          {step === 7 && (
            <StepPublish
              publishMode={publishMode}
              setPublishMode={setPublishMode}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              scheduleTime={scheduleTime}
              setScheduleTime={setScheduleTime}
              timezone={timezone}
              title={title}
              coverUrl={coverUrl}
              startDate={startDate}
              venue={venue}
              menuEnabled={menuConfig.enabled}
              perksEnabled={perksEnabled}
              ticketCount={tickets.length}
              recurrence={recurrence}
              startTime={startTime}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer — desktop inline */}
      {isDesktop ? (
        <div data-testid="create-event-footer" className="mt-8 border-t border-white/10 pt-6">
          {footerActions}
        </div>
      ) : null}
          </div>
        </div>
      </div>

      {/* Footer — mobile fixed */}
      {!isDesktop ? (
        <div
          data-testid="create-event-footer"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl"
        >
          <div className="web-container px-4 py-4 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
            {footerActions}
          </div>
        </div>
      ) : null}

      <ImagePickerSheet
        open={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        title="Choose cover image"
        onSelect={setCoverUrl}
      />
      <ImagePickerSheet
        open={showGalleryPicker}
        onClose={() => setShowGalleryPicker(false)}
        title="Add gallery photo"
        onSelect={(src) => setGalleryImages((prev) => [...prev, src])}
      />
      <VideoPickerSheet
        open={showVideoPicker}
        onClose={() => setShowVideoPicker(false)}
        title="Add promo video"
        onSelect={(src) => setPromoVideos((prev) => [...prev, src])}
      />
    </div>
  )
}

function StepBasics({
  title, setTitle, description, setDescription, category, setCategory, tags, setTags, coverUrl, onPickCover,
}: {
  title: string; setTitle: (v: string) => void
  description: string; setDescription: (v: string) => void
  category: string; setCategory: (v: string) => void
  tags: string; setTags: (v: string) => void
  coverUrl: string
  onPickCover: () => void
}) {
  return (
    <FormSection title="Event basics" subtitle="Name, category, and cover image">
      <FormField label="Event title *">
        <FormInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Neon Nights: Fall Edition" />
      </FormField>
      <FormField label="Description">
        <FormTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </FormField>
      <FormField label="Category">
        <FormSelect value={category} onChange={setCategory} options={categories} />
      </FormField>
      <FormField label="Tags" hint="Comma separated">
        <FormInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="techno, warehouse" />
      </FormField>
      <FormField label="Cover image">
        <div className="overflow-hidden rounded-[14px]">
          <img src={coverUrl} alt="" className="h-44 w-full object-cover" />
        </div>
        <button type="button" onClick={onPickCover} className="mt-3 w-full rounded-[14px] border border-dashed border-white/20 py-3 text-sm text-[#0a84ff]">
          Choose cover photo
        </button>
      </FormField>
    </FormSection>
  )
}

function StepWhenWhere({
  startDate, setStartDate, startTime, setStartTime, endDate, setEndDate, endTime, setEndTime,
  timezone, setTimezone, venue, setVenue, address, setAddress,
  recurrence, setRecurrence,
}: {
  startDate: string; setStartDate: (v: string) => void
  startTime: string; setStartTime: (v: string) => void
  endDate: string; setEndDate: (v: string) => void
  endTime: string; setEndTime: (v: string) => void
  timezone: string; setTimezone: (v: string) => void
  venue: string; setVenue: (v: string) => void
  address: string; setAddress: (v: string) => void
  recurrence: EventRecurrence
  setRecurrence: (v: EventRecurrence) => void
}) {
  const point = geocodeAddress(address, venue)
  return (
    <FormSection title="When & where" subtitle="Schedule, recurrence, and venue location">
      <RecurrencePicker recurrence={recurrence} onChange={setRecurrence} startTime={startTime} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label={isRecurring(recurrence) ? 'Series starts *' : 'Start date *'}>
          <FormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label="Start time *">
          <FormInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </FormField>
        {!isRecurring(recurrence) && (
          <>
            <FormField label="End date">
              <FormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </FormField>
            <FormField label="End time">
              <FormInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </FormField>
          </>
        )}
      </div>
      <FormField label="Timezone">
        <FormSelect value={timezone} onChange={setTimezone} options={['America/Los_Angeles', 'America/New_York', 'Europe/London', 'UTC']} />
      </FormField>
      <FormField label="Venue name *">
        <FormInput value={venue} onChange={(e) => setVenue(e.target.value)} />
      </FormField>
      <FormField label="Address *">
        <FormInput value={address} onChange={(e) => setAddress(e.target.value)} />
      </FormField>
      <EventMap lat={point.lat} lng={point.lng} label={`${venue} · ${address}`} height={180} />
    </FormSection>
  )
}

function StepTickets({
  format, setFormat, capacity, setCapacity, tickets, setTickets, isFree, setIsFree, seatingPlan, onOpenSeating, onApplySeatingPlan,
}: {
  format: string; setFormat: (v: (typeof formatOptions)[number]) => void
  capacity: string; setCapacity: (v: string) => void
  tickets: TicketDraft[]; setTickets: (v: TicketDraft[]) => void
  isFree: boolean; setIsFree: (v: boolean) => void
  seatingPlan: SeatingPlan | null
  onOpenSeating: () => void
  onApplySeatingPlan: (plan: SeatingPlan) => void
}) {
  const isSeated = format === 'Seated' || format === 'Hybrid'
  const stats = seatingPlan ? planStats(seatingPlan) : null

  return (
    <FormSection title="Tickets & seating" subtitle="Format, capacity, and pricing">
      <FormToggle label="Free event (RSVP only)" checked={isFree} onChange={setIsFree} />
      <FormField label="Event format">
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((f) => (
            <FormChip key={f} label={f} selected={format === f} onClick={() => setFormat(f)} />
          ))}
        </div>
      </FormField>
      {isSeated && (
        <>
          <button
            type="button"
            onClick={onOpenSeating}
            className="w-full rounded-[18px] liquid-glass p-4 text-left transition-colors active:bg-white/10"
          >
            <p className="ios-headline">🎭 Open seating studio</p>
            <p className="mt-1 ios-caption">
              {stats
                ? `${formatPlanSummary(seatingPlan!)} · $${stats.revenue.toLocaleString()} max revenue`
                : 'Floors, sections or tables, stage placement & per-seat pricing'}
            </p>
          </button>
          <SeatingTemplateLoad onLoad={onApplySeatingPlan} />
        </>
      )}
      {!isSeated && (
        <FormField label="Capacity">
          <FormInput type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </FormField>
      )}
      {!isFree && (
        <>
          <p className="ios-caption px-1">Ticket types {isSeated && seatingPlan ? '(synced from seating studio)' : ''}</p>
          {tickets.map((t, i) => (
            <div key={i} className="rounded-[18px] liquid-glass-subtle p-4">
              <FormInput
                value={t.name}
                onChange={(e) => {
                  const next = [...tickets]
                  next[i] = { ...t, name: e.target.value }
                  setTickets(next)
                }}
                className="mb-2 font-medium"
              />
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  placeholder="Price $"
                  value={t.price}
                  onChange={(e) => {
                    const next = [...tickets]
                    next[i] = { ...t, price: e.target.value }
                    setTickets(next)
                  }}
                />
                <FormInput
                  placeholder="Quantity"
                  value={t.quantity}
                  onChange={(e) => {
                    const next = [...tickets]
                    next[i] = { ...t, quantity: e.target.value }
                    setTickets(next)
                  }}
                />
              </div>
            </div>
          ))}
          {!isSeated && (
            <button
              type="button"
              onClick={() => setTickets([...tickets, { name: 'New tier', price: '0', quantity: '50', perks: [] }])}
              className="w-full rounded-[14px] border border-dashed border-white/20 py-2.5 text-sm text-[#0a84ff]"
            >
              + Add ticket type
            </button>
          )}
        </>
      )}
    </FormSection>
  )
}

const PERK_OPTIONS = [
  { label: 'Welcome drink', emoji: '🍹' },
  { label: 'Drink token', emoji: '🎟️' },
  { label: 'Free appetizer', emoji: '🍽️' },
  { label: 'VIP access', emoji: '⭐' },
  { label: 'Merch', emoji: '👕' },
] as const

function StepPerks({
  perksEnabled, setPerksEnabled, tickets, togglePerk, redemptionWindow, setRedemptionWindow,
}: {
  perksEnabled: boolean; setPerksEnabled: (v: boolean) => void
  tickets: TicketDraft[]
  togglePerk: (ticketIndex: number, perk: string) => void
  redemptionWindow: string
  setRedemptionWindow: (v: string) => void
}) {
  return (
    <FormSection
      title="Included perks"
      subtitle="Bundle drinks, tokens, and VIP access with ticket tiers"
    >
      <FormToggle
        label="Bundle perks with tickets"
        desc="Welcome drinks, tokens, VIP access"
        checked={perksEnabled}
        onChange={setPerksEnabled}
      />
      {perksEnabled && (
        <>
          {tickets.map((t, i) => (
            <FormField key={i} label={t.name} hint="Tap perks to include with this ticket">
              {t.perks.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {t.perks.map((p) => (
                    <Badge key={p} variant="primary">{p}</Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {PERK_OPTIONS.map(({ label, emoji }) => (
                  <FormChip
                    key={label}
                    label={`${emoji} ${label}`}
                    selected={t.perks.includes(label)}
                    onClick={() => togglePerk(i, label)}
                  />
                ))}
              </div>
            </FormField>
          ))}
          <FormField label="Redemption window">
            <FormSelect
              value={redemptionWindow}
              onChange={setRedemptionWindow}
              options={['On entry only', 'First 2 hours', 'All night']}
            />
          </FormField>
        </>
      )}
      <div className="h-32" aria-hidden />
    </FormSection>
  )
}

function StepMedia({
  galleryImages,
  onAddGallery,
  onRemoveGallery,
  promoVideos,
  onAddVideo,
  onRemoveVideo,
  externalVideoUrl,
  setExternalVideoUrl,
  lineup,
  setLineup,
  coverUrl,
}: {
  galleryImages: string[]
  onAddGallery: () => void
  onRemoveGallery: (index: number) => void
  promoVideos: string[]
  onAddVideo: () => void
  onRemoveVideo: (index: number) => void
  externalVideoUrl: string
  setExternalVideoUrl: (v: string) => void
  lineup: string[]
  setLineup: (v: string[]) => void
  coverUrl: string
}) {
  return (
    <FormSection
      title="Media & lineup"
      subtitle="Gallery photos, promo video, and performers for your event page"
    >
      <FormField label="Cover preview" hint="Change the cover on the Basics step">
        <div className="overflow-hidden rounded-[16px]">
          <img src={coverUrl} alt="" className="aspect-[16/9] w-full object-cover" />
        </div>
      </FormField>

      <FormField label="Gallery photos" hint="Tap + to add more photos">
        <div className="flex flex-wrap gap-2">
          {galleryImages.map((src, i) => (
            <div key={`${src}-${i}`} className="relative">
              <img src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveGallery(i)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff453a] text-[10px] text-white"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onAddGallery}
            className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/20 text-white/40 transition-colors hover:border-white/35 hover:text-white/60"
            aria-label="Add gallery photo"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </FormField>

      <FormField label="Promo videos" hint="Upload clips from your device or pick a sample">
        <div className="space-y-3">
          {promoVideos.map((src, i) => (
            <div key={`${src}-${i}`} className="relative overflow-hidden rounded-[14px] bg-black">
              <video src={src} controls className="aspect-video w-full" playsInline />
              <button
                type="button"
                onClick={() => onRemoveVideo(i)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff453a] text-white"
                aria-label="Remove video"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddVideo}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/20 py-3 text-sm font-medium text-[#0a84ff]"
          >
            <Plus className="h-4 w-4" />
            Add video
          </button>
        </div>
      </FormField>

      <FormField label="External video link" hint="Optional YouTube or Vimeo URL">
        <FormInput
          value={externalVideoUrl}
          onChange={(e) => setExternalVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
      </FormField>

      <FormField label="Lineup / performers">
        <div className="space-y-2">
          {lineup.map((name, i) => (
            <div key={i} className="flex gap-2">
              <FormInput
                value={name}
                onChange={(e) => {
                  const next = [...lineup]
                  next[i] = e.target.value
                  setLineup(next)
                }}
                placeholder={`Performer ${i + 1}`}
                className="flex-1"
              />
              {lineup.length > 1 && (
                <button
                  type="button"
                  onClick={() => setLineup(lineup.filter((_, j) => j !== i))}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#ff453a]/15 text-[#ff453a]"
                  aria-label="Remove performer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLineup([...lineup, ''])}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/20 py-3 text-sm font-medium text-[#0a84ff]"
        >
          <Plus className="h-4 w-4" />
          Add performer
        </button>
      </FormField>

      <div className="h-32" aria-hidden />
    </FormSection>
  )
}

function StepSettings({
  visibility, setVisibility, ageRestriction, setAgeRestriction,
  reservationRequired, setReservationRequired, memoriesEnabled, setMemoriesEnabled,
  refundPolicy, setRefundPolicy, registrationQuestions, setRegistrationQuestions,
}: {
  visibility: string; setVisibility: (v: string) => void
  ageRestriction: string; setAgeRestriction: (v: string) => void
  reservationRequired: boolean; setReservationRequired: (v: boolean) => void
  memoriesEnabled: boolean; setMemoriesEnabled: (v: boolean) => void
  refundPolicy: string; setRefundPolicy: (v: string) => void
  registrationQuestions: string[]
  setRegistrationQuestions: (v: string[]) => void
}) {
  return (
    <FormSection
      title="Event settings"
      subtitle="Visibility, policies, and custom registration questions"
    >
      <FormField label="Visibility">
        <FormSelect value={visibility} onChange={setVisibility} options={visibilityOptions} />
      </FormField>
      <FormField label="Age restriction">
        <FormSelect value={ageRestriction} onChange={setAgeRestriction} options={ageOptions} />
      </FormField>
      <FormToggle
        label="Require reservation / RSVP"
        checked={reservationRequired}
        onChange={setReservationRequired}
      />
      <FormToggle
        label="Allow attendee memories"
        desc="Verified attendees can post photos & reviews after"
        checked={memoriesEnabled}
        onChange={setMemoriesEnabled}
      />
      <FormField label="Refund policy">
        <FormTextarea
          value={refundPolicy}
          onChange={(e) => setRefundPolicy(e.target.value)}
          rows={3}
        />
      </FormField>
      <FormField label="Custom registration questions" hint="Ask attendees at checkout">
        <div className="space-y-2">
          {registrationQuestions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <FormInput
                value={q}
                onChange={(e) => {
                  const next = [...registrationQuestions]
                  next[i] = e.target.value
                  setRegistrationQuestions(next)
                }}
                placeholder="e.g. Dietary restrictions?"
                className="flex-1"
              />
              {registrationQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRegistrationQuestions(registrationQuestions.filter((_, j) => j !== i))}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#ff453a]/15 text-[#ff453a]"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRegistrationQuestions([...registrationQuestions, ''])}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/20 py-3 text-sm font-medium text-[#0a84ff]"
        >
          <Plus className="h-4 w-4" />
          Add question
        </button>
      </FormField>
      <div className="h-32" aria-hidden />
    </FormSection>
  )
}

function StepPublish({
  publishMode, setPublishMode, scheduleDate, setScheduleDate, scheduleTime, setScheduleTime,
  timezone, title, coverUrl, startDate, venue, menuEnabled, perksEnabled, ticketCount,
  recurrence, startTime,
}: {
  publishMode: 'draft' | 'now' | 'schedule'
  setPublishMode: (v: 'draft' | 'now' | 'schedule') => void
  scheduleDate: string; setScheduleDate: (v: string) => void
  scheduleTime: string; setScheduleTime: (v: string) => void
  timezone: string
  title: string; coverUrl: string; startDate: string; venue: string
  menuEnabled: boolean; perksEnabled: boolean; ticketCount: number
  recurrence: EventRecurrence
  startTime: string
}) {
  const modes = [
    { id: 'draft' as const, icon: '📝', label: 'Save as draft', desc: 'Not visible to anyone' },
    { id: 'now' as const, icon: '🚀', label: 'Publish now', desc: 'Goes live immediately' },
    { id: 'schedule' as const, icon: '⏰', label: 'Schedule publish', desc: 'Set date & time to go live' },
  ]

  return (
    <>
      <h2 className="mb-4 text-lg font-bold">Review & publish</h2>

      <div className="mb-6 overflow-hidden rounded-2xl glass">
        <img src={coverUrl} alt="" className="h-36 w-full object-cover" />
        <div className="p-4">
          <p className="font-bold text-lg">{title}</p>
          <p className="text-sm text-slate-400">
            {isRecurring(recurrence)
              ? formatRecurrence(recurrence, startTime)
              : `${startDate} · ${venue}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{ticketCount} ticket types</Badge>
            {isRecurring(recurrence) && <Badge variant="primary">Recurring</Badge>}
            {menuEnabled && <Badge>Menu enabled</Badge>}
            {perksEnabled && <Badge>Perks included</Badge>}
          </div>
        </div>
      </div>

      <p className="mb-3 font-medium">Publishing options</p>
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setPublishMode(m.id)}
          className={`mb-2 flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all ${
            publishMode === m.id ? 'bg-primary/20 ring-2 ring-primary' : 'glass'
          }`}
        >
          <span className="text-2xl">{m.icon}</span>
          <div>
            <p className="font-medium">{m.label}</p>
            <p className="text-xs text-slate-400">{m.desc}</p>
          </div>
        </button>
      ))}

      {publishMode === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4"
        >
          <p className="mb-3 text-sm font-medium text-primary-light">Scheduled publish time</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </Field>
            <Field label="Time">
              <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            </Field>
          </div>
          <p className="text-xs text-slate-400">Timezone: {timezone}</p>
          <p className="mt-2 text-sm text-slate-300">
            Event page will automatically publish on <strong>{scheduleDate}</strong> at <strong>{scheduleTime}</strong>
          </p>
        </motion.div>
      )}
    </>
  )
}
