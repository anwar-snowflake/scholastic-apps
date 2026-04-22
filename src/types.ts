export type AttendanceStatus = 'present' | 'sick' | 'permission' | 'absent' | 'pending';

export interface Student {
  id: string;
  name: string;
  nis: string;
  photoUrl: string;
  class: string;
  attendance: Record<string, AttendanceStatus>; // date string -> status
}

export interface ClassSession {
  id: string;
  name: string;
  room: string;
  startTime: string;
  endTime: string;
  classGroup: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  attendanceRate?: number;
  students: string[]; // student ids
}

export interface AttendanceNote {
  id: string;
  studentId: string;
  date: string;
  type: AttendanceStatus;
  content: string;
  icon?: string;
}
