export interface ExamEnrollment {
    id: number;
    exam_name: string;
    price: string;
    full_name: string;
    nationality: string;
    faculty_name: string;
    university_name: string;
    national_id: string;
    passport_number: string | null;
    phone: string;
    degree: string;
    payment_date: string;
    fawry_receipt: string | null;
    bank_receipt: string | null;
    receipt_url: string;
    status: 'pending' | 'approved' | 'completed' | string;
    created_at: string;
    updated_at: string;
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface ExamEnrollmentsResponse {
    success: boolean;
    message: string;
    data: ExamEnrollment[];
    pagination: Pagination;
}
