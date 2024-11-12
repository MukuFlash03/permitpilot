'use client'

import { useEffect, useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import {
  ArrowRightStartOnRectangleIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  QueueListIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  QuestionMarkCircleIcon,
  SparklesIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'

interface FormData {
  id: string
  name: string
  featured: boolean
  due_date?: string
}

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="#">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="#">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

export function ApplicationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [featuredForms, setFeaturedForms] = useState<FormData[]>([])
  const [dueSoonForms, setDueSoonForms] = useState<FormData[]>([])

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch('/api/forms')
        const data = await response.json()

        // Convert the object to an array of forms
        const formsArray = Object.entries(data).map(([id, form]: [string, any]) => ({
          id,
          name: form.name,
          featured: form.featured,
          due_date: form.due_date
        }))

        // Filter featured forms
        const featured = formsArray.filter(form => form.featured)
        setFeaturedForms(featured)

        // Filter forms due in next 14 days
        const now = new Date()
        const fourteenDaysFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000))

        const dueSoon = formsArray
          .filter(form => {
            if (!form.due_date) return false
            const dueDate = new Date(form.due_date)
            return dueDate >= now && dueDate <= fourteenDaysFromNow
          })
          .sort((a, b) => {
            if (!a.due_date || !b.due_date) return 0
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          })

        setDueSoonForms(dueSoon)
      } catch (error) {
        console.error('Error fetching forms:', error)
      }
    }

    fetchForms()
  }, [])

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src="/users/erica.jpg" square />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <Avatar src="/companies/thellamabean.png" />
                <SidebarLabel>The Llama Bean</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/settings">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <Avatar slot="icon" src="/companies/llamaramaramen.png" />
                  <DropdownLabel>Llama-Rama-Ramen</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="#">
                  <Avatar slot="icon" initials="LM" className="bg-purple-500 text-white" />
                  <DropdownLabel>Llama Mia</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <PlusIcon />
                  <DropdownLabel>New business&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <QueueListIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/chat" current={pathname.startsWith('/chat')}>
                <SparklesIcon />
                <SidebarLabel>AI Chat</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/business" current={pathname.startsWith('/business')}>
                <BuildingStorefrontIcon />
                <SidebarLabel>My Business</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/business_mini" current={pathname.startsWith('/business_mini')}>
                <BuildingStorefrontIcon />
                <SidebarLabel>My Business Details</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Featured Forms</SidebarHeading>
              {featuredForms.map((form) => (
                <SidebarItem key={form.id} href={`/forms/${form.id}`}>
                  {form.name}
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Due Soon</SidebarHeading>
              {dueSoonForms.map((form) => (
                <SidebarItem
                  key={form.id}
                  href={`/forms/${form.id}`}
                >
                  <div className="flex flex-col w-full gap-1">
                    <span className="line-clamp-2">{form.name}</span>
                    {form.due_date && (
                      <Badge color="red" className="w-fit text-xs">
                        Due {new Date(form.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </SidebarItem>
              ))}
              {dueSoonForms.length === 0 && (
                <div className="px-3 py-2 text-sm text-zinc-500">
                  No forms due soon
                </div>
              )}
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="#">
                <QuestionMarkCircleIcon />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar src="/users/moe.png" className="size-10" square alt="" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      Moe
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      moe@moe-llama.ai
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}