import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consolidated Business Information',
}

export default function SS4FormInfo() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>My Business</Heading>
      <Divider className="my-10 mt-6" />

      {/* Business Identification */}
      <section className="space-y-6">
        <Subheading>Business Identification</Subheading>
        <div className="space-y-1">
          <Text><strong>Legal Name:</strong> Legal name of entity</Text>
          <Text><strong>Trade Name:</strong> Trade name/DBA</Text>
          <Text><strong>Business Structure:</strong> Type of entity/business structure</Text>
          <Text><strong>State of Incorporation:</strong> State of incorporation/organization</Text>
          <Text><strong>Business Start Date:</strong> Date business started or acquired</Text>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Contact Information */}
      <section className="space-y-6">
        <Subheading>Contact Information</Subheading>
        <div className="space-y-1">
          <Text><strong>Street Address:</strong> Street address of principal place of business</Text>
          <Text><strong>County and State:</strong> County and state of principal business</Text>
          <Text><strong>City, State, ZIP:</strong> City, state, and ZIP code</Text>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Personnel Information */}
      <section className="space-y-6">
        <Subheading>Personnel Information</Subheading>
        <div className="space-y-1">
          <Text><strong>Responsible Party:</strong> Responsible party name</Text>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Tax Registration */}
      <section className="space-y-6">
        <Subheading>Tax Registration</Subheading>
        <div className="space-y-1">
          <Text><strong>Accounting Year:</strong> Closing month of accounting year</Text>
          <Text><strong>Employment Info:</strong> Employment information</Text>
        </div>
      </section>
    </div>
  )
}
