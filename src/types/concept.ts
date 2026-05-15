export type Category =
  | 'Brain Regions'
  | 'Cognitive Biases'
  | 'Emotion Systems'
  | 'Motivation & Reward'
  | 'Memory'
  | 'Decision Making';

export type Difficulty = 'Beginner' | 'University' | 'Research';

export interface ConceptSummary {
  beginner: string;
  university: string;
  research: string;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface Concept {
  id: string;
  title: string;
  category: Category;
  brain_region: string;
  difficulty: Difficulty;
  summary: ConceptSummary;
  triggers: string[];
  effects: string[];
  real_life_examples: string[];
  related_topics: string[];
  tags: string[];
  map_position: MapPosition;
}
