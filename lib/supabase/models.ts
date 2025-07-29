export interface Newsletter {
  id: string;
  user_id: string;
  title: string;
  content: string;
  categories: string[];
  article_count: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}
