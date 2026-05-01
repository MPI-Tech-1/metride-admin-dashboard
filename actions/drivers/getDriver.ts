"use server"

import httpClientInstance from "@/actions/http-client"

export interface DriverDetailDTO {
  identifier: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  fcmToken: string | null
  lastLoggedInAt: string | null
  status: "approved" | "pending" | "rejected"
  createdAt: string
  updatedAt: string
  driverPersonalInformation: {
    identifier: string
    dateOfBirth: string | null
    gender: string | null
    homeAddress: string | null
    cityId: string | null
    nationalIdentificationNumber: string | null
    createdAt: string
    updatedAt: string
  }
  driverRegistrationStep: {
    identifier: string
    hasActivatedAccount: boolean
    hasProvidedPersonalInformation: boolean
    hasProvidedVehicleInformation: boolean
    hasProvidedRequiredDocuments: boolean
    hasProvidedBankAccount: boolean
  }
  driverBankAccount: {
    identifier: string
    bank: {
      identifier: string
      name: string
    } | null
    accountName: string | null
    accountNumber: string | null
    createdAt: string
    updatedAt: string
  }
  driverDocument: {
    identifier: string
    passportPhotographUrl: string | null
    driverLicenceUrl: string | null
    vehiclePaperUrl: string | null
    vehiclePhotoUrl: string | null
    createdAt: string
    updatedAt: string
  }
  driverApprovalSteps: {
    identifier: string
    status: string
    reason: string | null
    createdAt: string
    updatedAt: string
  }[]
}

interface GetDriverResponse {
  status_code: number
  status: string
  message: string
  results: DriverDetailDTO
}

export default async function getDriver(
  driverIdentifier: string
): Promise<DriverDetailDTO> {
  try {
    const { data } = await httpClientInstance.get<GetDriverResponse>(
      `/driver-management/drivers/${driverIdentifier}`
    )
    return data.results
  } catch (getDriverError) {
    throw getDriverError
  }
}
