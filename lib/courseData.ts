export interface Course {
  id: string;
  title: string;
  description: string;
  credits: number;
  prerequisites: string[];
  coordinates: {
    x: number;
    y: number;
  };
}

export const courses: Course[] = [
  {
    id: "MBA501",
    title: "Leadership and Organizational Behavior",
    description: "Study of human behavior in organizations, focusing on individual, group, and organizational processes.",
    credits: 3,
    prerequisites: [],
    coordinates: { x: 0, y: 0 }
  },
  {
    id: "MBA502",
    title: "Financial Management",
    description: "Analysis of financial decision making at the corporate level.",
    credits: 3,
    prerequisites: [],
    coordinates: { x: 1, y: 0 }
  },
  {
    id: "MBA503",
    title: "Marketing Management",
    description: "Strategic marketing decision making in a global environment.",
    credits: 3,
    prerequisites: [],
    coordinates: { x: 0, y: 1 }
  },
  {
    id: "MBA504",
    title: "Data Analytics for Business",
    description: "Application of statistical and operations research techniques to business decision making.",
    credits: 3,
    prerequisites: [],
    coordinates: { x: 1, y: 1 }
  },
  {
    id: "MBA505",
    title: "Strategic Management",
    description: "Integration of business functions for strategic planning and implementation.",
    credits: 3,
    prerequisites: ["MBA501"],
    coordinates: { x: 2, y: 0 }
  }
];