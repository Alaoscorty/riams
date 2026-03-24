export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = [
  { id: "dish-grillade", description: "Grillade", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", imageHint: "food" },
  { id: "dish-fish", description: "Poisson", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop", imageHint: "food" },
  { id: "dish-burger", description: "Burger", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", imageHint: "food" },
  { id: "dish-cocktail", description: "Cocktail", imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop", imageHint: "drink" },
  { id: "hero-bg", description: "Hero Background", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop", imageHint: "restaurant" },
];
