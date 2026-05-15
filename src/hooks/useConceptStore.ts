import { create } from 'zustand';
import type { Concept, Category, Difficulty } from '../types/concept';
import conceptsData from '../data/concepts.json';

const concepts = conceptsData as Concept[];

interface ConceptStore {
  concepts: Concept[];
  selectedConcept: Concept | null;
  activeCategory: Category | null;
  difficultyLevel: Difficulty;
  unlockedConcepts: Set<string>;
  viewedConcepts: Set<string>;
  breadcrumbs: Concept[];
  pendingWalkTarget: Concept | null;

  // Direct selection — resets breadcrumb trail (map/random clicks)
  selectConcept: (concept: Concept | null) => void;
  // Graph navigation — pushes current to breadcrumbs (InfoPanel related-concept clicks)
  navigateToConcept: (concept: Concept) => void;
  // Go back to a breadcrumb position, truncate trail after it
  jumpToBreadcrumb: (index: number) => void;

  setActiveCategory: (category: Category | null) => void;
  setDifficultyLevel: (level: Difficulty) => void;
  selectRandomConcept: () => void;
  unlockConcept: (id: string) => void;
  markViewed: (id: string) => void;
  clearWalkTarget: () => void;
  filteredConcepts: () => Concept[];
  getRelatedConcepts: (concept: Concept) => Concept[];
}

export const useConceptStore = create<ConceptStore>((set, get) => ({
  concepts,
  selectedConcept: null,
  activeCategory: null,
  difficultyLevel: 'Beginner',
  unlockedConcepts: new Set<string>(),
  viewedConcepts: new Set<string>(),
  breadcrumbs: [],
  pendingWalkTarget: null,

  selectConcept: (concept) => {
    set({ selectedConcept: concept, breadcrumbs: [], pendingWalkTarget: null });
    if (concept) get().markViewed(concept.id);
  },

  navigateToConcept: (concept) => {
    const { selectedConcept } = get();
    set((state) => ({
      breadcrumbs: selectedConcept
        ? [...state.breadcrumbs, selectedConcept]
        : state.breadcrumbs,
      selectedConcept: concept,
      pendingWalkTarget: concept,
    }));
    get().markViewed(concept.id);
  },

  jumpToBreadcrumb: (index) => {
    const { breadcrumbs } = get();
    const target = breadcrumbs[index];
    if (!target) return;
    set({
      selectedConcept: target,
      breadcrumbs: breadcrumbs.slice(0, index),
      pendingWalkTarget: target,
    });
  },

  setActiveCategory: (category) => set({ activeCategory: category }),

  setDifficultyLevel: (level) => set({ difficultyLevel: level }),

  selectRandomConcept: () => {
    const { concepts, activeCategory } = get();
    const pool = activeCategory
      ? concepts.filter((c) => c.category === activeCategory)
      : concepts;
    const random = pool[Math.floor(Math.random() * pool.length)];
    get().selectConcept(random);
  },

  unlockConcept: (id) =>
    set((state) => ({
      unlockedConcepts: new Set([...state.unlockedConcepts, id]),
    })),

  markViewed: (id) =>
    set((state) => ({
      viewedConcepts: new Set([...state.viewedConcepts, id]),
    })),

  clearWalkTarget: () => set({ pendingWalkTarget: null }),

  filteredConcepts: () => {
    const { concepts, activeCategory } = get();
    if (!activeCategory) return concepts;
    return concepts.filter((c) => c.category === activeCategory);
  },

  getRelatedConcepts: (concept) => {
    const { concepts } = get();
    return concept.related_topics
      .map((id) => concepts.find((c) => c.id === id))
      .filter((c): c is Concept => c !== undefined);
  },
}));
