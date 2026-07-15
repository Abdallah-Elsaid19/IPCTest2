import { apiJson } from "@/lib/api";

export interface CreateClubEnquiryPayload {
  email: string;
  message: string;
  clubName?: string;
  clubSlug?: string;
  pageUrl?: string;
  website?: string;
}

export interface CreateClubEnquiryResponse {
  success: true;
  data: {
    id: string;
    message: string;
  };
}

export function createClubEnquiry(payload: CreateClubEnquiryPayload) {
  return apiJson<CreateClubEnquiryResponse>("/api/clubs/enquiries/", payload);
}

