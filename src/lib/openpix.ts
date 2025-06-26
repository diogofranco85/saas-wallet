import { ICreateAccountRequest, ICreateAccountResponse, ICreateBillingRequest, ICreateBillingResponse, ICreatePartner } from "@/types/openpix.interface"
import axios from "axios"
const baseURL = process.env.WOOVI_URL
const token = process.env.WOOVI_TOKEN

const http = axios.create({
  baseURL,
  headers: {
    "Authorization": token
  }
})

export const createSubAccount = async (params: ICreateAccountRequest): Promise<ICreateAccountResponse> => {
  try {
    const { data }: { data: ICreateAccountResponse } = await http.post("/api/v1/subaccount", params)

    if (data) {
      return data
    }

    throw new Error("Response is void")
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message)
  }
}

export const createBilling = async (params: ICreateBillingRequest): Promise<ICreateBillingResponse> => {
  try {
    const { data }: { data: ICreateBillingResponse } = await http.post("/api/v1/charge", params)
    if (data) {
      return data
    }

    throw new Error("Response is void")
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message)
  }
}

export const createPartner = async (params: ICreatePartner) => {

  try {
    const { data }: { data: ICreatePartner } = await http.post("/api/v1/partner/company", params)
    if (data) {
      return data
    }

    throw new Error("Response is void")
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message)
  }
}
