import { Exam } from './exams.model';

export interface DashboardStats {
  total_students: number;
  active_courses: number;
  upcoming_exams: number;
  new_services: number;
  upcoming_exams_list: Exam[];
  recent_reviews: any[];
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}
