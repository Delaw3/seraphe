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
