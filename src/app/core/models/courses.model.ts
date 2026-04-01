export interface CourseStats {
    total_enrolled_students: number;
    running_courses: number;
    courses_by_level: {
        [key: string]: number;
    };
}

export interface Course {
    id: number;
    name: string;
    instructor_name: string;
    level_translated: string;
    duration_days: number;
    start_date: string;
    enrolled_students: number;
    max_students: number;
    available_seats: number;
    price: string;
    status: string;
}

export interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

export interface CoursesResponse {
    success: boolean;
    message: string;
    data: {
        stats: CourseStats;
        courses: Course[];
        pagination: Pagination;
    };
}
