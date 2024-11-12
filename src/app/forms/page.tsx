import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Heading } from '@/components/heading'
import { Input, InputGroup } from '@/components/input'
import { Link } from '@/components/link'
import { Select } from '@/components/select'
import { getForms } from '@/data-forms'
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forms',
}

export default async function Forms() {
  let forms = await getForms()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'required':
        return 'red'
      case 'optional':
        return 'lime'
      case 'conditional':
        return 'amber'
      default:
        return 'zinc'
    }
  }

  const getCategoryIcon = (category: string) => {
    // You can replace these with actual category icons if needed
    return '📄'
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Forms</Heading>
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input name="search" placeholder="Search forms..." />
              </InputGroup>
            </div>
            <div>
              <Select name="sort_by">
                <option value="name">Sort by name</option>
                <option value="category">Sort by category</option>
                <option value="jurisdiction">Sort by jurisdiction</option>
              </Select>
            </div>
          </div>
        </div>
        <Button>Create form</Button>
      </div>
      <ul className="mt-10">
        {forms.map((form, index) => (
          <>
            <li key={form.id}>
              <Divider soft={index > 0} />
              <div className="flex items-center justify-between">
                <div className="flex gap-6 py-6">
                  <div className="w-12 shrink-0 flex items-center justify-center text-2xl">
                    {getCategoryIcon(form.category)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-base/6 font-semibold">
                      <Link href={`/forms/${form.id}`}>{form.name}</Link>
                    </div>
                    <div className="text-xs/6 text-zinc-500">
                      {form.governingBody} · {form.category.charAt(0).toUpperCase() + form.category.slice(1)}
                    </div>
                    <div className="text-xs/6 text-zinc-600">
                      {form.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    className="max-sm:hidden" 
                    color={getStatusColor(form.status)}
                  >
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </Badge>
                  <Badge 
                    className="max-sm:hidden"
                    color="zinc"
                  >
                    {form.jurisdiction.charAt(0).toUpperCase() + form.jurisdiction.slice(1)}
                  </Badge>
                  <Dropdown>
                    <DropdownButton plain aria-label="More options">
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem href={form.resourceUrl}>View Resource</DropdownItem>
                      <DropdownItem href={`/forms/${form.id}`}>Details</DropdownItem>
                      <DropdownItem>Edit</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </li>
          </>
        ))}
      </ul>
    </>
  )
}