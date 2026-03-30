export interface Enrollment {
    id: number;
    course_name: string;
    price: string;
    full_name: string;
    nationality: 'egyptian' | 'expatriate' | string;

    faculty_name: string;
    university_name: string;
    national_id?: string;
    passport_number?: string | null;
    phone: string;
    degree: string;
    payment_date: string;
    fawry_receipt?: string;
    bank_receipt?: string | null;
    receipt_url: string;
    status: 'approved' | 'pending' | 'rejected' | 'rejected_and_resend';
    created_at: string;
    updated_at: string;
}
