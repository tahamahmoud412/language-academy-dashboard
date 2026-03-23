export interface MultilingualString {
  ar: string;
  en: string;
}

export interface TopicRequest {
  title: MultilingualString;
  description: MultilingualString;
  hours: number;
  sort_order: number;
}

export interface ScheduleRequest {
  lecture_date: string;
  start_time: string;
  end_time: string;
}

export interface CourseRequest {
  name: MultilingualString;
  instructor_name: MultilingualString;
  description: MultilingualString;
  location: MultilingualString;
  start_date: string;
  end_date: string;
  duration_days: number;
  price: number;
  max_students: number;
  registration_deadline: string;
  level: string;
  language: string;
  status: string;
  course_category_id: number;
  topics: TopicRequest[];
  schedules: ScheduleRequest[];
}
