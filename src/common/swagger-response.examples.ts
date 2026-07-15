export const authResponseExample = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  admin: {
    id: '6690f3f5e7f9c1a001234567',
    name: 'Seraphe Admin',
    email: 'admin@seraphebeauty.org',
  },
};

export const categoryExample = {
  _id: '6690f3f5e7f9c1a001234568',
  name: 'Skincare',
  slug: 'skincare',
  description: 'Beauty products for healthy skin.',
  image: 'https://cdn.seraphebeauty.org/categories/skincare.jpg',
  order: 1,
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const productExample = {
  _id: '6690f3f5e7f9c1a001234569',
  name: 'Hydrating Face Cream',
  slug: 'hydrating-face-cream',
  shortDescription: 'A lightweight cream for daily hydration.',
  description: 'Full product description and usage details.',
  category: categoryExample,
  price: 15000,
  discountPrice: 12000,
  images: ['https://cdn.seraphebeauty.org/products/cream-1.jpg'],
  stock: 25,
  sku: 'SERA-CREAM-001',
  tags: ['face', 'cream', 'hydrating'],
  isFeatured: true,
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const reviewExample = {
  _id: '6690f3f5e7f9c1a001234570',
  product: '6690f3f5e7f9c1a001234569',
  rating: 5,
  name: 'Jane Doe',
  email: 'jane@example.com',
  reviewText: 'This product feels lovely and worked well for my skin.',
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const beautyTipExample = {
  _id: '6690f3f5e7f9c1a001234571',
  title: 'Managing Hormonal Acne Breakouts',
  slug: 'managing-hormonal-acne-breakouts',
  category: 'Acne',
  categorySlug: 'acne',
  level: 'Beginner',
  summary:
    'A targeted guide on using salicylic acid and niacinamide effectively.',
  content: 'Full guide content for the beauty tip.',
  readTimeMinutes: 4,
  image: 'https://cdn.seraphebeauty.org/tips/acne.jpg',
  tags: ['acne', 'salicylic acid'],
  order: 1,
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const lifestyleArticleExample = {
  _id: '6690f3f5e7f9c1a001234572',
  title: 'Top 3 Regina Daniels Beauty Secrets',
  slug: 'top-3-regina-daniels-beauty-secrets',
  category: 'Make-Up',
  categorySlug: 'make-up',
  excerpt:
    'Find helpful application techniques and product routines for glowing skin.',
  content: 'Full lifestyle article content.',
  author: 'Ogunmola Gbemisola',
  readTimeMinutes: 5,
  image: 'https://cdn.seraphebeauty.org/lifestyle/glowing-skin.jpg',
  tags: ['skin', 'makeup'],
  isFeatured: false,
  order: 1,
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const serapheModelExample = {
  _id: '6690f3f5e7f9c1a001234573',
  name: 'Amina Bello',
  slug: 'amina-bello',
  category: 'Top Icons',
  categorySlug: 'top-icons',
  badge: 'Industry Icon',
  location: 'Seraphé Elite (Lagos)',
  portfolioSummary: 'Vogue, Chanel, Seraphé Editorial Autumn',
  bio: 'Amina is a Lagos-based model known for editorial beauty work.',
  height: "179 cm / 5'10.5\"",
  bust: '81 cm',
  waist: '60 cm',
  featureImage: 'https://cdn.seraphebeauty.org/models/amina-feature.jpg',
  images: [
    'https://cdn.seraphebeauty.org/models/amina-1.jpg',
    'https://cdn.seraphebeauty.org/models/amina-2.jpg',
  ],
  tags: ['editorial', 'beauty', 'runway'],
  isFeatured: true,
  order: 1,
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const trendExample = {
  _id: '6690f3f5e7f9c1a001234574',
  title: 'The Rise of Neurocosmetics',
  slug: 'the-rise-of-neurocosmetics',
  focusArea: 'Skincare',
  focusAreaSlug: 'skincare',
  label: 'Trending Now',
  subtitle: 'Connecting Mind and Skin Barrier',
  excerpt:
    'Explore how topicals formulated for skin-stress responses are changing beauty.',
  content: 'Full trend analysis content.',
  author: 'Seraphe Editorial',
  featureImage: 'https://cdn.seraphebeauty.org/trends/neurocosmetics.jpg',
  images: [
    'https://cdn.seraphebeauty.org/trends/neurocosmetics-1.jpg',
    'https://cdn.seraphebeauty.org/trends/neurocosmetics-2.jpg',
  ],
  hashtags: ['#neurocosmetics', '#skincare', '#skinbarrier'],
  readTimeMinutes: 6,
  publishedAt: '2026-06-01T00:00:00.000Z',
  isFeatured: true,
  order: 1,
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const teamMemberExample = {
  _id: '6690f3f5e7f9c1a001234575',
  name: 'Jane Doe',
  role: 'Managing Director',
  section: 'Beauty Science Team',
  sectionSlug: 'beauty-science-team',
  image: 'https://cdn.seraphebeauty.org/team/jane-doe.jpg',
  bio: 'Jane leads product research and beauty science strategy.',
  email: 'jane@seraphebeauty.org',
  linkedin: 'https://linkedin.com/in/janedoe',
  instagram: 'https://instagram.com/janedoe',
  order: 1,
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const communitySubscriberExample = {
  _id: '6690f3f5e7f9c1a001234577',
  email: 'jane@example.com',
  name: 'Jane Doe',
  source: 'website-footer',
  subscribedAt: '2026-07-14T10:00:00.000Z',
  createdAt: '2026-07-14T10:00:00.000Z',
  updatedAt: '2026-07-14T10:00:00.000Z',
};

export const paginationMetaExample = {
  page: 1,
  limit: 12,
  total: 42,
  totalPages: 4,
};

export function successResponseExample<T>(message: string, data: T) {
  return {
    success: true,
    message,
    data,
  };
}

export function paginatedResponseExample<T>(message: string, data: T[]) {
  return {
    success: true,
    message,
    data,
    meta: paginationMetaExample,
  };
}

export const shopHomeResponseExample = successResponseExample(
  'Shop retrieved successfully.',
  {
    categories: [categoryExample],
    featuredProducts: [productExample],
  },
);

export const productDetailResponseExample = successResponseExample(
  'Product retrieved successfully.',
  {
    product: productExample,
    relatedProducts: [productExample],
  },
);

export const beautyTipCategoriesResponseExample = successResponseExample(
  'Beauty tip categories retrieved successfully.',
  [
    { name: 'All', slug: 'all' },
    { name: 'Acne', slug: 'acne' },
  ],
);

export const lifestyleCategoriesResponseExample = successResponseExample(
  'Lifestyle categories retrieved successfully.',
  [
    { name: 'All Lifestyle', slug: 'all' },
    { name: 'Make-Up', slug: 'make-up' },
    { name: 'Fragrances', slug: 'fragrances' },
  ],
);

export const serapheModelCategoriesResponseExample = successResponseExample(
  'Seraphé model categories retrieved successfully.',
  [
    { name: 'All', slug: 'all' },
    { name: 'Top Icons', slug: 'top-icons' },
    { name: 'The Hot List', slug: 'the-hot-list' },
    { name: 'New Faces', slug: 'new-faces' },
    { name: 'Runway Elite', slug: 'runway-elite' },
  ],
);

export const trendFocusAreasResponseExample = successResponseExample(
  'Trend focus areas retrieved successfully.',
  [
    { name: 'All', slug: 'all' },
    { name: 'Skincare', slug: 'skincare' },
    { name: 'Makeup', slug: 'makeup' },
    { name: 'Haircare', slug: 'haircare' },
    { name: 'Wellness', slug: 'wellness' },
  ],
);

export const teamSectionsResponseExample = successResponseExample(
  'Team sections retrieved successfully.',
  [
    { name: 'Beauty Science Team', slug: 'beauty-science-team' },
    { name: 'Technical Team', slug: 'technical-team' },
    { name: 'Project Leadership', slug: 'project-leadership' },
  ],
);

export const teamGroupedResponseExample = successResponseExample(
  'Team sections retrieved successfully.',
  [
    {
      name: 'Beauty Science Team',
      slug: 'beauty-science-team',
      members: [teamMemberExample],
    },
    {
      name: 'Technical Team',
      slug: 'technical-team',
      members: [
        {
          ...teamMemberExample,
          _id: '6690f3f5e7f9c1a001234576',
          section: 'Technical Team',
          sectionSlug: 'technical-team',
        },
      ],
    },
  ],
);
