import { menuItems as catalogItems } from '../data/mockData'
import { media } from '../data/media'

export type MenuTab = {
  id: string
  name: string
  emoji: string
}

export type EventMenuItem = {
  id: string
  name: string
  /** Short line shown in lists */
  description: string
  /** Full detail copy in item sheet */
  longDescription?: string
  ingredients?: string[]
  price: number
  tabId: string
  /** @deprecated use images */
  image?: string
  images?: string[]
  tags?: string[]
  ageRestricted?: boolean
  popular?: boolean
}

export type MenuItemReview = {
  id: string
  itemId: string
  eventId: string
  user: { id: string; name: string; avatar: string }
  rating: number
  body: string
  time: string
}

export type EventMenuConfig = {
  enabled: boolean
  preorderEnabled: boolean
  menuType: string
  tabs: MenuTab[]
  items: EventMenuItem[]
}

export type MenuTemplate = {
  id: string
  name: string
  menuType: string
  tabs: MenuTab[]
  items: EventMenuItem[]
  savedAt: string
}

export function itemImages(item: EventMenuItem): string[] {
  if (item.images?.length) return item.images
  if (item.image) return [item.image]
  return []
}

export function averageRating(reviews: MenuItemReview[]): number | null {
  if (reviews.length === 0) return null
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function normalizeMenuItem(item: EventMenuItem): EventMenuItem {
  const images = itemImages(item)
  return {
    ...item,
    image: images[0],
    images,
  }
}

const CATEGORY_TO_TAB: Record<string, string> = {
  Cocktails: 'beverages',
  Beer: 'beverages',
  'Zero-proof': 'beverages',
  Food: 'food',
}

export const DEFAULT_MENU_TABS: MenuTab[] = [
  { id: 'beverages', name: 'Beverages', emoji: '🍹' },
  { id: 'food', name: 'Food', emoji: '🍽️' },
  { id: 'snacks', name: 'Snacks', emoji: '🥨' },
]

export function createDefaultEventMenu(): EventMenuConfig {
  return {
    enabled: true,
    preorderEnabled: true,
    menuType: 'Bar',
    tabs: [...DEFAULT_MENU_TABS],
    items: catalogItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      longDescription: item.longDescription,
      ingredients: item.ingredients,
      price: item.price,
      tabId: CATEGORY_TO_TAB[item.category] ?? 'snacks',
      image: item.image,
      images: item.images ?? (item.image ? [item.image] : []),
      tags: item.tags,
      ageRestricted: item.ageRestricted,
      popular: item.popular,
    })),
  }
}

export function createEmptyMenu(): EventMenuConfig {
  return {
    enabled: true,
    preorderEnabled: true,
    menuType: 'Bar',
    tabs: [{ id: 'beverages', name: 'Beverages', emoji: '🍹' }],
    items: [],
  }
}

export function menuItemCount(config: EventMenuConfig): number {
  return config.enabled ? config.items.length : 0
}

export function itemsForTab(config: EventMenuConfig, tabId: string): EventMenuItem[] {
  return config.items.filter((item) => item.tabId === tabId)
}

export function menuTabsWithCounts(config: EventMenuConfig) {
  return config.tabs.map((tab) => ({
    ...tab,
    count: itemsForTab(config, tab.id).length,
  }))
}

export function createMenuItem(tabId: string): EventMenuItem {
  const id = `item-${Date.now()}`
  return {
    id,
    name: 'New item',
    description: '',
    longDescription: '',
    ingredients: [],
    price: 10,
    tabId,
    images: [media.food],
    image: media.food,
  }
}

export function createMenuTab(index: number): MenuTab {
  const id = `tab-${Date.now()}`
  return {
    id,
    name: `Category ${index + 1}`,
    emoji: '📋',
  }
}

export function configFromTemplate(template: MenuTemplate): EventMenuConfig {
  return {
    enabled: true,
    preorderEnabled: true,
    menuType: template.menuType,
    tabs: template.tabs.map((t) => ({ ...t })),
    items: template.items.map((i) => ({ ...i })),
  }
}

export function templateFromConfig(config: EventMenuConfig, name: string): MenuTemplate {
  return {
    id: `tpl-${Date.now()}`,
    name,
    menuType: config.menuType,
    tabs: config.tabs.map((t) => ({ ...t })),
    items: config.items.map((i) => ({ ...i })),
    savedAt: new Date().toISOString(),
  }
}

/** Map ticket perk strings to representative menu items for checkout display */
export function includedItemsFromPerks(
  perks: string[],
  menu: EventMenuConfig,
): { label: string; detail: string; emoji: string }[] {
  return perks.map((perk) => {
    const lower = perk.toLowerCase()
    if (lower.includes('drink') || lower.includes('token')) {
      const drink = menu.items.find((i) => i.tabId === 'beverages')
      return {
        label: perk,
        detail: drink ? `Redeem for any ${drink.name} or similar` : 'Redeem at the bar',
        emoji: '🍹',
      }
    }
    if (lower.includes('appetizer') || lower.includes('food')) {
      const food = menu.items.find((i) => i.tabId === 'food')
      return {
        label: perk,
        detail: food ? `Includes ${food.name} or equivalent` : 'Redeem at food counter',
        emoji: '🍽️',
      }
    }
    if (lower.includes('vip') || lower.includes('lounge')) {
      return { label: perk, detail: 'Access included with your ticket', emoji: '⭐' }
    }
    return { label: perk, detail: 'Included with your ticket', emoji: '🎟️' }
  })
}
