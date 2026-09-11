export type WordStatus = "UNLEARNED" | "LEARNING" | "MASTERED";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    words: number;
  };
}

export interface CategoryDetail extends Category {
  words: {
    id: string;
    term: string;
    meaning: string;
    status: WordStatus;
    partOfSpeech: string | null;
    exampleSentence: string | null;
    createdAt: string;
  }[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
}