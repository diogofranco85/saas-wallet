import { HttpException } from "@/helpers/http-exceptions"
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

    throw new HttpException(400, "Response is void")

  } catch (error: any) {
    console.error("open pix :: create billing", error)
    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(error.status || 503, error.response?.data || error.message)
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

// export const createSubAccount = async (params: { pixKey: string, name: string }) => {
//   try {
//     const { data }: { data: { subAccount: { name: string, pixKey: string } } } = await http.post('/api/v1/subaccount', params)
//     if (data) {
//       return data
//     }

//     throw new Error("Response is void")
//   } catch (error: any) {
//     throw new Error(error.response?.data?.error || error.message)
//   }
// }

export const withDrawSubAccount = async (pixKey: string) => {
  try {
    const { data }: { data: ICreatePartner } = await http.get(`/api/v1/subaccount/${pixKey}/withdraw`)
    if (data) {
      return data
    }

    throw new Error("Response is void")
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message)
  }
}
