export interface Course {
  id: string;
  name: string;
  description: string;
  credits: number;
  prerequisites?: string[];
  category: "core" | "finance" | "marketing" | "management" | "elective";
}