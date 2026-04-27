export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  heroImage?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  description: string;
  parentId?: string;
}
