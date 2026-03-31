export interface DashboardStats {
    total_students: number;
    active_courses: number;
    upcoming_exams: number;
    new_services: number;
    upcoming_exams_list: UpcomingExam[];
    recent_reviews: any[];
}

export interface UpcomingExam {
    id: number;
    name: string;
    description: string;
    exam_type: {
        id: number;
        name: string;
    };
    exam_date: string;
    exam_time: string;
    duration_minutes: number;
    formatted_duration: string;
    price: {
        value: string;
        formatted: string;
    };
    max_students: number;
    enrolled_students: number;
    registration_deadline: string;
    status: string;
    statistics: {
        total_points: number;
        total_questions: number;
        total_time_minutes: number;
    };
    created_at: string;
    updated_at: string;
}
