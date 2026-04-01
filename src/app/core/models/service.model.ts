export interface Service {
    id: number;
    title: string;
    description: string;
    features: string[];
    image: string | null;
    created_at: string;
    updated_at: string;
}

export interface ServiceRequest {
    title: string;
    description: string;
    features: string[];
    image?: File | null;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}
