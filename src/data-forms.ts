export interface Form {
  id: number
  name: string
  governingBody: string
  description: string
  resourceUrl: string
  status: 'required' | 'optional' | 'conditional'
  category: 'registration' | 'permits' | 'insurance' | 'tax' | 'health' | 'safety'
  jurisdiction: 'federal' | 'state' | 'local'
  frequency: 'Once' | 'Annual' | 'Quarterly' | 'Miscellaneous'
}

export async function getForms() {
  return [
    {
      id: 1001,
      name: "Business Registration Certificate",
      governingBody: "City and County of San Francisco",
      description: "Register your business with the City and County of San Francisco",
      resourceUrl: "https://sf.gov/business-registration",
      status: "required",
      category: "registration",
      jurisdiction: "local",
      frequency: "Annual"
    },
    {
      id: 1002,
      name: "Employer Identification Number (EIN)",
      governingBody: "Internal Revenue Service (IRS)",
      description: "Federal Tax ID for your business",
      resourceUrl: "https://www.irs.gov/ein",
      status: "required",
      category: "tax",
      jurisdiction: "federal",
      frequency: "Once"
    },
    {
      id: 1003,
      name: "Seller's Permit",
      governingBody: "California Department of Tax and Fee Administration",
      description: "Required for selling or leasing tangible personal property",
      resourceUrl: "https://www.cdtfa.ca.gov/services/#Register-Renewals",
      status: "required",
      category: "permits",
      jurisdiction: "state",
      frequency: "Once"
    },
    {
      id: 1004,
      name: "Fictitious Business Name Statement",
      governingBody: "City and County of San Francisco",
      description: "Required when doing business under a name different from the owner's",
      resourceUrl: "https://sf.gov/fictitious-business-name",
      status: "conditional",
      category: "registration",
      jurisdiction: "local",
      frequency: "Once"
    },
    {
      id: 1005,
      name: "Health Permit",
      governingBody: "San Francisco Department of Public Health",
      description: "Required for food-related businesses",
      resourceUrl: "https://sf.gov/health-permits",
      status: "conditional",
      category: "health",
      jurisdiction: "local",
      frequency: "Annual"
    },
    {
      id: 1006,
      name: "Food Safety Manager Certification",
      governingBody: "San Francisco Department of Public Health",
      description: "Required for food service establishments",
      resourceUrl: "https://sf.gov/food-safety-certification",
      status: "conditional",
      category: "health",
      jurisdiction: "local",
      frequency: "Annual"
    },
    {
      id: 1007,
      name: "Building Permit",
      governingBody: "San Francisco Department of Building Inspection",
      description: "Required for construction or renovation",
      resourceUrl: "https://sf.gov/building-permits",
      status: "conditional",
      category: "permits",
      jurisdiction: "local",
      frequency: "Once"
    },
    {
      id: 1008,
      name: "Workers' Compensation Insurance",
      governingBody: "California Division of Workers' Compensation",
      description: "Required for businesses with employees",
      resourceUrl: "https://www.dir.ca.gov/dwc/",
      status: "required",
      category: "insurance",
      jurisdiction: "state",
      frequency: "Annual"
    },
    {
      id: 1009,
      name: "Fire Department Permit",
      governingBody: "San Francisco Fire Department",
      description: "Required for businesses with specific fire safety needs",
      resourceUrl: "https://sf.gov/fire-permits",
      status: "conditional",
      category: "safety",
      jurisdiction: "local",
      frequency: "Annual"
    },
    {
      id: 1010,
      name: "Liquor License",
      governingBody: "California Department of Alcoholic Beverage Control",
      description: "Required for selling alcohol",
      resourceUrl: "https://www.abc.ca.gov/licensing/",
      status: "conditional",
      category: "permits",
      jurisdiction: "state",
      frequency: "Miscellaneous"
    },
    {
      id: 1011,
      name: "Property Taxes",
      governingBody: "San Francisco Office of the Assessor-Recorder",
      description: "Required for business property owners",
      resourceUrl: "https://sf.gov/property-tax",
      status: "conditional",
      category: "tax",
      jurisdiction: "local",
      frequency: "Annual"
    },
    {
      id: 1012,
      name: "Federal Income Tax & FUTA",
      governingBody: "Internal Revenue Service (IRS)",
      description: "Required federal tax filings",
      resourceUrl: "https://www.irs.gov/businesses",
      status: "required",
      category: "tax",
      jurisdiction: "federal",
      frequency: "Annual"
    },
    {
      id: 1013,
      name: "California Income Tax & UI Tax",
      governingBody: "California Franchise Tax Board",
      description: "Required state tax filings",
      resourceUrl: "https://www.ftb.ca.gov/businesses/",
      status: "required",
      category: "tax",
      jurisdiction: "state",
      frequency: "Annual"
    },
    {
      id: 1014,
      name: "Gross Receipts Tax",
      governingBody: "City and County of San Francisco",
      description: "Local business tax based on gross receipts",
      resourceUrl: "https://sf.gov/gross-receipts-tax",
      status: "required",
      category: "tax",
      jurisdiction: "local",
      frequency: "Annual"
    },
    {
      id: 1015,
      name: "Health Care Security Ordinance",
      governingBody: "San Francisco Department of Public Health",
      description: "Required health care spending for covered employers",
      resourceUrl: "https://sf.gov/hcso",
      status: "conditional",
      category: "health",
      jurisdiction: "local",
      frequency: "Annual"
    }
  ]
}

export async function getForm(id: string) {
  return (await getForms()).find((form) => form.id.toString() === id)
}

export async function getFormsByCategory(category: string) {
  return (await getForms()).filter((form) => form.category === category)
}

export async function getFormsByJurisdiction(jurisdiction: string) {
  return (await getForms()).filter((form) => form.jurisdiction === jurisdiction)
}

export async function getRequiredForms() {
  return (await getForms()).filter((form) => form.status === 'required')
}

export async function getFormsByFrequency(frequency: string) {
  return (await getForms()).filter((form) => form.frequency === frequency)
}