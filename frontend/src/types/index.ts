export interface DailyTaking {
    store: string;
    date: string;
    daily_takings: number;
    created_at?: string;
    updated_at?: string;
}

export interface UploadResponse {
    store_name: string;
    daily_takings_data: DailyTaking[];
    message: string;
} 
