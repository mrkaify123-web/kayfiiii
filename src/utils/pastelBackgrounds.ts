export interface PastelBackgroundOption {
  name: string;
  hex: string;
  surfaceSecondary: string;
  borderColor: string;
  category: 'all' | 'blue' | 'green' | 'teal' | 'peach' | 'pink' | 'cream' | 'gray';
  categoryLabel: string;
}

export const PASTEL_BACKGROUNDS: PastelBackgroundOption[] = [
  // Blue & Sky
  {
    name: 'Soft Sky Blue',
    hex: '#e8f4fc',
    surfaceSecondary: '#dfedf7',
    borderColor: '#d1e9f8',
    category: 'blue',
    categoryLabel: 'Blue & Sky',
  },
  {
    name: 'Baby Blue',
    hex: '#e3f2fd',
    surfaceSecondary: '#daeaf7',
    borderColor: '#cde5f9',
    category: 'blue',
    categoryLabel: 'Blue & Sky',
  },
  {
    name: 'Powder Blue',
    hex: '#e0f0f8',
    surfaceSecondary: '#d7e8f2',
    borderColor: '#c8e4f3',
    category: 'blue',
    categoryLabel: 'Blue & Sky',
  },
  {
    name: 'Ocean Blue',
    hex: '#e6f1f8',
    surfaceSecondary: '#dbe8f2',
    borderColor: '#cee1ef',
    category: 'blue',
    categoryLabel: 'Blue & Sky',
  },
  {
    name: 'Blue Gray',
    hex: '#eef2f6',
    surfaceSecondary: '#e5ebf1',
    borderColor: '#dce3ec',
    category: 'blue',
    categoryLabel: 'Blue & Sky',
  },

  // Green & Mint
  {
    name: 'Mint',
    hex: '#e8f8f2',
    surfaceSecondary: '#dcf2e8',
    borderColor: '#d0f1e4',
    category: 'green',
    categoryLabel: 'Green & Mint',
  },
  {
    name: 'Mint Green',
    hex: '#e6f7ef',
    surfaceSecondary: '#d9f1e4',
    borderColor: '#cef0e0',
    category: 'green',
    categoryLabel: 'Green & Mint',
  },
  {
    name: 'Sage Green',
    hex: '#edf3ea',
    surfaceSecondary: '#e3ece0',
    borderColor: '#d9e6d4',
    category: 'green',
    categoryLabel: 'Green & Mint',
  },
  {
    name: 'Soft Green',
    hex: '#eaf6ed',
    surfaceSecondary: '#dff0e4',
    borderColor: '#d3ebd9',
    category: 'green',
    categoryLabel: 'Green & Mint',
  },
  {
    name: 'Pistachio',
    hex: '#eef5e6',
    surfaceSecondary: '#e4eed8',
    borderColor: '#dbe9ce',
    category: 'green',
    categoryLabel: 'Green & Mint',
  },
  {
    name: 'Seafoam',
    hex: '#e4f6f0',
    surfaceSecondary: '#daf0e8',
    borderColor: '#ccede3',
    category: 'green',
    categoryLabel: 'Green & Mint',
  },

  // Teal & Aqua
  {
    name: 'Soft Aqua',
    hex: '#e0f7f6',
    surfaceSecondary: '#d6f0ee',
    borderColor: '#c7efed',
    category: 'teal',
    categoryLabel: 'Teal & Aqua',
  },
  {
    name: 'Soft Teal',
    hex: '#e2f4f2',
    surfaceSecondary: '#d7ece9',
    borderColor: '#cbe9e6',
    category: 'teal',
    categoryLabel: 'Teal & Aqua',
  },

  // Peach & Coral
  {
    name: 'Peach',
    hex: '#fdede2',
    surfaceSecondary: '#f6e4d7',
    borderColor: '#f8decb',
    category: 'peach',
    categoryLabel: 'Peach & Coral',
  },
  {
    name: 'Soft Peach',
    hex: '#fff0e6',
    surfaceSecondary: '#fae8dc',
    borderColor: '#fde2ce',
    category: 'peach',
    categoryLabel: 'Peach & Coral',
  },
  {
    name: 'Apricot',
    hex: '#fceee4',
    surfaceSecondary: '#f6e5da',
    borderColor: '#f7ddcc',
    category: 'peach',
    categoryLabel: 'Peach & Coral',
  },
  {
    name: 'Coral',
    hex: '#fdebe8',
    surfaceSecondary: '#f7e1dd',
    borderColor: '#f9d7d2',
    category: 'peach',
    categoryLabel: 'Peach & Coral',
  },
  {
    name: 'Soft Orange',
    hex: '#fff3e8',
    surfaceSecondary: '#fbeadc',
    borderColor: '#fce4ce',
    category: 'peach',
    categoryLabel: 'Peach & Coral',
  },
  {
    name: 'Light Terracotta',
    hex: '#f7ece6',
    surfaceSecondary: '#efe2db',
    borderColor: '#ebd8ce',
    category: 'peach',
    categoryLabel: 'Peach & Coral',
  },

  // Pink & Rose
  {
    name: 'Soft Pink',
    hex: '#fceef3',
    surfaceSecondary: '#f6e4ea',
    borderColor: '#f9dbe4',
    category: 'pink',
    categoryLabel: 'Pink & Rose',
  },
  {
    name: 'Blush Pink',
    hex: '#faebef',
    surfaceSecondary: '#f3e1e7',
    borderColor: '#f5d5de',
    category: 'pink',
    categoryLabel: 'Pink & Rose',
  },
  {
    name: 'Rose Pink',
    hex: '#fbe8ee',
    surfaceSecondary: '#f4dde4',
    borderColor: '#f7d0db',
    category: 'pink',
    categoryLabel: 'Pink & Rose',
  },
  {
    name: 'Dusty Rose',
    hex: '#f5eaed',
    surfaceSecondary: '#ede0e4',
    borderColor: '#ecd5db',
    category: 'pink',
    categoryLabel: 'Pink & Rose',
  },
  {
    name: 'Soft Mauve',
    hex: '#f4edef',
    surfaceSecondary: '#ede3e6',
    borderColor: '#e9dce0',
    category: 'pink',
    categoryLabel: 'Pink & Rose',
  },

  // Cream & Warm
  {
    name: 'Cream',
    hex: '#faf6ee',
    surfaceSecondary: '#f3eee4',
    borderColor: '#f0e8d7',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Warm Cream',
    hex: '#fbf7ec',
    surfaceSecondary: '#f5eedd',
    borderColor: '#f3ebd2',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Ivory',
    hex: '#fcf9f2',
    surfaceSecondary: '#f7f2e8',
    borderColor: '#f4eee0',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Beige',
    hex: '#f6f3ed',
    surfaceSecondary: '#eee8dd',
    borderColor: '#ebe4d7',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Sand',
    hex: '#f5f1e8',
    surfaceSecondary: '#ede6d8',
    borderColor: '#eae3d4',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Champagne',
    hex: '#f8f4ec',
    surfaceSecondary: '#f1ebde',
    borderColor: '#ede5d7',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Soft Yellow',
    hex: '#fefce8',
    surfaceSecondary: '#fcf7d7',
    borderColor: '#fbf6c6',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Butter Yellow',
    hex: '#fef9e3',
    surfaceSecondary: '#faf0ce',
    borderColor: '#faeebe',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },
  {
    name: 'Pale Lemon',
    hex: '#fcfbe6',
    surfaceSecondary: '#f9f6d0',
    borderColor: '#f8f6be',
    category: 'cream',
    categoryLabel: 'Cream & Warm',
  },

  // Slate & Gray
  {
    name: 'Soft Gray',
    hex: '#f3f4f6',
    surfaceSecondary: '#eaecf0',
    borderColor: '#e2e5e9',
    category: 'gray',
    categoryLabel: 'Slate & Gray',
  },
  {
    name: 'Warm Gray',
    hex: '#f5f4f2',
    surfaceSecondary: '#ebe8e5',
    borderColor: '#e6e3df',
    category: 'gray',
    categoryLabel: 'Slate & Gray',
  },
  {
    name: 'Cool Gray',
    hex: '#f1f3f5',
    surfaceSecondary: '#e7ebee',
    borderColor: '#e0e3e7',
    category: 'gray',
    categoryLabel: 'Slate & Gray',
  },
  {
    name: 'Soft Slate',
    hex: '#eaedf1',
    surfaceSecondary: '#e0e5eb',
    borderColor: '#d5dbe2',
    category: 'gray',
    categoryLabel: 'Slate & Gray',
  },
];

export const PASTEL_BACKGROUND_MAP: Record<string, PastelBackgroundOption> =
  PASTEL_BACKGROUNDS.reduce((acc, item) => {
    acc[item.name.toLowerCase()] = item;
    acc[item.hex.toLowerCase()] = item;
    return acc;
  }, {} as Record<string, PastelBackgroundOption>);

export function findPastelBackground(query?: string | null): PastelBackgroundOption | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  return PASTEL_BACKGROUND_MAP[q] || PASTEL_BACKGROUNDS.find((b) => b.name.toLowerCase() === q) || null;
}
