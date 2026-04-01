export interface CourseCategory {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: number | boolean;
    courses_count?: number;
    created_at?: string;
}

