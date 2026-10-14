export interface LaundryProgram {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface ProgramListResponse {
  programs: LaundryProgram[];
}
