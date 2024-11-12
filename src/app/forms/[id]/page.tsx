import { Badge } from '@/components/badge'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import formsData from '@/app/data/forms.json'
import ActionButtons from './action-buttons'

interface FormField {
  description: string;
  options?: string[];
  fields?: string[];
}

interface FormSection {
  [key: string]: FormField;
}

interface Form {
  name: string;
  description: string;
  status: string;
  category: string;
  governingBody: string;
  due_date?: string;
  frequency?: string;
  featured?: boolean;
  generatePDF: boolean;
  submitOnline: boolean;
  autoFillForm: boolean;
  sections?: {
    [key: string]: FormSection;
  };
}

const formsDataTyped = formsData as unknown as { [key: string]: Form };

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const form = formsDataTyped[params.id];

  if (!form) {
    return {
      title: 'Form Not Found',
    };
  }

  return {
    title: form.name,
  };
}

export default function FormPage({ params }: { params: { id: string } }) {
  const form = formsDataTyped[params.id];

  if (!form) {
    notFound();
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/forms" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Forms
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Heading>{form.name}</Heading>
            <Badge
              color={form.status.toLowerCase() === 'required' ? 'red' :
                form.status.toLowerCase() === 'optional' ? 'lime' : 'amber'}
            >
              {form.status}
            </Badge>
          </div>
          <div className="mt-2 text-sm/6 text-zinc-500">
            {form.description || form.governingBody}
            <span aria-hidden="true"> · </span>
            Due: {form.due_date ? new Date(form.due_date).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <ActionButtons
          formName={form.name}
          generatePDF={form.generatePDF}
          submitOnline={form.submitOnline}
          autoFillForm={form.autoFillForm}
        />
      </div>

      {form.sections && (
        <form className="mt-8">
          {Object.entries(form.sections).map(([sectionKey, section]: [string, FormSection]) => (
            <div key={sectionKey} className="mb-8">
              <Subheading className="mb-4">
                {sectionKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Subheading>
              <Table className="[--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
                <TableBody>
                  {Object.entries(section).map(([fieldKey, field]: [string, FormField]) => {
                    if (field.options) {
                      return (
                        <TableRow key={fieldKey}>
                          <TableCell className="font-medium">{field.description}</TableCell>
                          <TableCell>
                            <select
                              id={fieldKey}
                              name={fieldKey}
                              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                            >
                              <option value="">Select {field.description}</option>
                              {field.options.map((option: string) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                        </TableRow>
                      )
                    }

                    if (field.fields) {
                      return field.fields.map((subField: string) => (
                        <TableRow key={`${fieldKey}-${subField}`}>
                          <TableCell className="font-medium">{subField}</TableCell>
                          <TableCell>
                            <input
                              type="text"
                              id={`${fieldKey}-${subField}`}
                              name={`${fieldKey}-${subField}`}
                              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                              placeholder={subField}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    }

                    return (
                      <TableRow key={fieldKey}>
                        <TableCell className="font-medium">{field.description}</TableCell>
                        <TableCell>
                          <input
                            type="text"
                            id={fieldKey}
                            name={fieldKey}
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                            placeholder={field.description}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ))}
        </form>
      )}
    </>
  );
}