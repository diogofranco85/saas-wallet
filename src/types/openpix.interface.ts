import { TaxTypeEnum } from "@/enums/tax-type.enum";

export interface ICreateAccountRequest {
  pixKey: string;
  name: string
}

export interface ICreateAccountResponse {
  name: string;
  pixKey: string;
  balance: number
}

export interface ICreateBillingRequest {
  correlationID: string;
  value: number
  comment?: string
  costumer?: {
    name: string;
    taxID: TaxTypeEnum;
    email?: string;
    phone?: string;
  },
  additionalInfo?: Record<string, string>[],
  subaccount?: string
  splits?: {
    value: number
    pixKey: string,
    splitType: "SPLIT_SUB_ACCOUNT" | "SPLIT_INTERNAL_TRANSFER" | "SPLIT_PARTNER"
  }[]
  expiresIn?: number // Em segundos, padrão 60 * 15 (15 minutos)
}

export interface ICreateBillingResponse {
  charge: {
    status: string;
    costumer?: {
      name: string;
      taxID: string;
      email: string;
      phone: string
    },
    value: number;
    comment: string,
    correlationID: string;
    paymentLinkID: string;
    paymentLinkUrl: string
    qrCodeImage: string;
    expiresIn: number;
    expiresDate: string;
    brCode: string,
    globalID: string
  }
}

export interface ICreatePartner {
  preRegistration: {
    name: string,
    website: string,
    taxID: {
      taxID: string
      type: TaxTypeEnum
    }
  },
  user: {
    firstName: string,
    lastName: string;
    email: string;
    phone: string
  }
}