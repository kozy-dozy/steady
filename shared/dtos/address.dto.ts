export type AddressBookEntryDto = {
    id: string
    label?: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country?: string
    instructions?: string
    isDefault?: boolean
}

export type AddressFormValuesDto = {
    label: string
    line1: string
    line2: string
    city: string
    state: string
    zip: string
    country: string
    instructions: string
    isDefault: boolean
}
