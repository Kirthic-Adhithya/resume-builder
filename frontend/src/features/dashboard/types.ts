export interface Resume {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ResumeListResponse {
  items: Resume[]
  total: number
  page: number
  page_size: number
}
