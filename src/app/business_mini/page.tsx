// import { Divider } from '@/components/divider'
// import { Heading, Subheading } from '@/components/heading'
// import { Text } from '@/components/text'
// import type { Metadata } from 'next'

// export const metadata: Metadata = {
//   title: 'Consolidated Business Information',
// }

// export default function SS4FormInfo() {
//   return (
//     <div className="mx-auto max-w-4xl">
//       <Heading>My Business Details</Heading>
//       <Divider className="my-10 mt-6" />

//       {/* Tax Registration */}
//       <section className="space-y-6">
//         <Subheading>Tax Registration</Subheading>
//         <div className="space-y-1">
//           <Text><strong>Accounting Year:</strong> Closing month of accounting year</Text>
//           <Text><strong>Employment Info:</strong> Employment information</Text>
//         </div>
//       </section>
//     </div>
//   )
// }


import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Text } from '@/components/text'
import type { Metadata } from 'next'
import businessDetails from '@/lib/business_details.json'

export const metadata: Metadata = {
  title: 'Consolidated Business Information',
}

export default function SS4FormInfo() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>My Business Details</Heading>
      <Divider className="my-10 mt-6" />

      {/* Business Information */}
      <section className="space-y-6">
        <Subheading>Business Information</Subheading>
        <div className="space-y-1">
          <Text><strong>Business Owner:</strong> {businessDetails["(Business Owner)"]}</Text>
          <Text><strong>Phone:</strong> {businessDetails["(Business Owner Phone)"]}</Text>
          <Text><strong>Business Name:</strong> {businessDetails["(Name of Business DBA)"]}</Text>
          <Text><strong>Business Phone:</strong> {businessDetails["(Business Phone)"]}</Text>
          <Text><strong>Address:</strong> {businessDetails["(Business Address include street directions and suite number if applicable)"]}</Text>
          <Text><strong>City:</strong> {businessDetails["(City)"]}</Text>
          <Text><strong>Zip Code:</strong> {businessDetails["(Zip)"]}</Text>
        </div>
      </section>
    </div>
  )
}
