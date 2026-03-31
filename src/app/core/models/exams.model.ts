export interface ExamStats {
    total_upcoming: number;
    total_ongoing: number;
    total_finished: number;
}

export interface ExamType {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ExamPrice {
    value: string;
    formatted: string;
}

export interface ExamStatistics {
    total_points: number;
    total_questions: number;
    total_time_minutes: number;
}

export interface Exam {
    id: number;
    name: string;
    description: string;
    exam_type: ExamType;
    exam_date: string;
    exam_time: string;
    duration_minutes: number;
    formatted_duration: string;
    price: ExamPrice;
    max_students: number;
    enrolled_students: number;
    registration_deadline: string;
    status: 'upcoming' | 'ongoing' | 'finished' | string;
    statistics: ExamStatistics;
    created_at?: string;
    updated_at?: string;
}

export interface ExamPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface ExamsResponse {
    success: boolean;
    message: string;
    data: {
        stats: ExamStats;
        exams: Exam[];
        pagination: ExamPagination;
    };
}
