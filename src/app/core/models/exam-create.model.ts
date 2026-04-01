export interface ExamOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface QuestionDetail {
  question_id?: number;
  question_text: string;
  options: ExamOption;
  correct_answer: string;
  points: number;
  section_type: string;
  passage?: string;
}

export interface ExamSection {
  section_type: string;
  time_minutes: number;
  passage?: string;
  questions: QuestionDetail[];
}

export interface ExamCreatePayload {
  name: string;
  description: string;
  exam_type_id: number;
  exam_date: string;
  exam_time: string;
  duration_minutes: number;
  price: number;
  max_students: number;
  registration_deadline: string;
  questions: QuestionDetail[]; // Updated to be flat
}
