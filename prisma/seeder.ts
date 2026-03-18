import {
  CheckoutStatus,
  ImageType,
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  Role,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const colorSeeds = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#F9FAFB' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Beige', hex: '#D6C3A1' },
  { name: 'Brown', hex: '#7C4A2D' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Navy', hex: '#1E3A8A' },
] as const;

const brandSeeds = [
  'Nike',
  'Adidas',
  'Puma',
  'Reebok',
  'Gucci',
  'New Balance',
  'The North Face',
  "Levi's",
  'Lacoste',
  'Valentino',
  'Tommy Hilfiger',
  'Converse',
] as const;

const genderSeeds = ['Uomo', 'Donna', 'Bambini', 'Unisex'] as const;

const categorySeeds = [
  { name: 'Abbigliamento', subCategories: ['T-shirt', 'Camicie', 'Felpe', 'Giacche', 'Pantaloni', 'Maglieria', 'Vestiti'] },
  { name: 'Scarpe', subCategories: ['Sneakers', 'Running', 'Eleganti', 'Boots'] },
  { name: 'Borse', subCategories: ['Tracolle', 'Mini Bag', 'Tote', 'Zaini'] },
  { name: 'Accessori', subCategories: ['Orologi', 'Cinture', 'Cappelli', 'Sciarpe'] },
  { name: 'Outdoor', subCategories: ['Giacche Tecniche', 'Pile', 'Zaini Trekking'] },
  { name: 'Sport', subCategories: ['Training', 'Leggings', 'Tracksuit'] },
] as const;

const featureSeeds = [
  {
    name: 'Materiale',
    type: 'select',
    options: ['Cotone', 'Poliestere', 'Mesh', 'Nylon', 'Pelle', 'Ecopelle', 'Denim', 'Lana', 'Canvas'],
  },
  {
    name: 'Taglia',
    type: 'select',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    name: 'Numero',
    type: 'select',
    options: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    category: 'Scarpe',
  },
  {
    name: 'Tipo scarpa',
    type: 'select',
    options: ['Running', 'Sneaker', 'Elegante', 'Boots', 'Trekking', 'Casual'],
    category: 'Scarpe',
  },
  {
    name: 'Capienza',
    type: 'select',
    options: ['Mini', 'Media', 'Grande'],
    category: 'Borse',
  },
  {
    name: 'Vestibilita',
    type: 'select',
    options: ['Slim', 'Regular', 'Oversize'],
    category: 'Abbigliamento',
  },
  {
    name: 'Impermeabilita',
    type: 'select',
    options: ['Bassa', 'Media', 'Alta'],
    category: 'Outdoor',
  },
  {
    name: 'Stile',
    type: 'select',
    options: ['Minimal', 'Classico', 'Sportivo', 'Luxury', 'Outdoor', 'Streetwear'],
  },
] as const;

type ProductSeed = {
  codeItem: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  gender: string;
  price: number;
  rating: number;
  availableQuantity: number;
  favorite?: boolean;
  promo?: boolean;
  percentualPromo?: number;
  plus?: boolean;
  newArrival?: boolean;
  colorNames: string[];
  featureValues: Record<string, string>;
};

const productSeeds: ProductSeed[] = [
  {
    codeItem: 'NK-TEE-001',
    name: 'Nike Tech Tee',
    description: 'T-shirt tecnica in cotone stretch, perfetta per allenamento leggero e look streetwear.',
    category: 'Abbigliamento',
    subCategory: 'T-shirt',
    brand: 'Nike',
    gender: 'Uomo',
    price: 34.9,
    rating: 4.4,
    availableQuantity: 18,
    favorite: true,
    promo: true,
    percentualPromo: 15,
    newArrival: true,
    colorNames: ['Black', 'White', 'Blue'],
    featureValues: {
      Materiale: 'Cotone',
      Taglia: 'M',
      Vestibilita: 'Regular',
      Stile: 'Sportivo',
    },
  },
  {
    codeItem: 'AD-LEG-002',
    name: 'Adidas Performance Leggings',
    description: 'Leggings ad alta compressione con fascia stabile e tessuto traspirante.',
    category: 'Sport',
    subCategory: 'Leggings',
    brand: 'Adidas',
    gender: 'Donna',
    price: 54.9,
    rating: 4.6,
    availableQuantity: 14,
    promo: true,
    percentualPromo: 20,
    newArrival: true,
    colorNames: ['Black', 'Pink'],
    featureValues: {
      Materiale: 'Poliestere',
      Taglia: 'S',
      Vestibilita: 'Slim',
      Stile: 'Sportivo',
    },
  },
  {
    codeItem: 'PM-RUN-003',
    name: 'Puma Velocity Runner',
    description: 'Scarpa running con tomaia mesh e ammortizzazione reattiva per allenamenti quotidiani.',
    category: 'Scarpe',
    subCategory: 'Running',
    brand: 'Puma',
    gender: 'Uomo',
    price: 94.9,
    rating: 4.5,
    availableQuantity: 21,
    promo: true,
    percentualPromo: 18,
    newArrival: true,
    colorNames: ['White', 'Green', 'Black'],
    featureValues: {
      Materiale: 'Mesh',
      Numero: '42',
      'Tipo scarpa': 'Running',
      Stile: 'Sportivo',
    },
  },
  {
    codeItem: 'RB-JKT-004',
    name: 'Reebok Storm Jacket',
    description: 'Giacca tecnica antivento con cappuccio regolabile e interno leggermente felpato.',
    category: 'Outdoor',
    subCategory: 'Giacche Tecniche',
    brand: 'Reebok',
    gender: 'Unisex',
    price: 119.9,
    rating: 4.7,
    availableQuantity: 9,
    plus: true,
    colorNames: ['Navy', 'Grey'],
    featureValues: {
      Materiale: 'Nylon',
      Taglia: 'L',
      Impermeabilita: 'Alta',
      Stile: 'Outdoor',
    },
  },
  {
    codeItem: 'GC-SHR-005',
    name: 'Gucci Silk Shirt',
    description: 'Camicia premium con mano morbida e silhouette pulita per outfit raffinati.',
    category: 'Abbigliamento',
    subCategory: 'Camicie',
    brand: 'Gucci',
    gender: 'Donna',
    price: 189.9,
    rating: 4.9,
    availableQuantity: 6,
    plus: true,
    promo: true,
    percentualPromo: 12,
    colorNames: ['White', 'Beige'],
    featureValues: {
      Materiale: 'Cotone',
      Taglia: 'S',
      Vestibilita: 'Regular',
      Stile: 'Luxury',
    },
  },
  {
    codeItem: 'NF-BPK-006',
    name: 'The North Face Basecamp Pack',
    description: 'Zaino multiuso con tasche tecniche, struttura resistente e comfort per tutto il giorno.',
    category: 'Outdoor',
    subCategory: 'Zaini Trekking',
    brand: 'The North Face',
    gender: 'Unisex',
    price: 89.9,
    rating: 4.8,
    availableQuantity: 13,
    favorite: true,
    newArrival: true,
    colorNames: ['Black', 'Green'],
    featureValues: {
      Materiale: 'Nylon',
      Capienza: 'Grande',
      Impermeabilita: 'Media',
      Stile: 'Outdoor',
    },
  },
  {
    codeItem: 'LC-POL-007',
    name: 'Lacoste Classic Polo',
    description: 'Polo iconica in piquet, versatile e curata nei dettagli.',
    category: 'Abbigliamento',
    subCategory: 'T-shirt',
    brand: 'Lacoste',
    gender: 'Uomo',
    price: 79.9,
    rating: 4.6,
    availableQuantity: 17,
    plus: true,
    colorNames: ['White', 'Navy', 'Green'],
    featureValues: {
      Materiale: 'Cotone',
      Taglia: 'M',
      Vestibilita: 'Regular',
      Stile: 'Classico',
    },
  },
  {
    codeItem: 'VL-BAG-008',
    name: 'Valentino Mini Bag',
    description: 'Mini bag elegante con finiture lucide e tracolla regolabile.',
    category: 'Borse',
    subCategory: 'Mini Bag',
    brand: 'Valentino',
    gender: 'Donna',
    price: 219.9,
    rating: 4.8,
    availableQuantity: 8,
    favorite: true,
    plus: true,
    newArrival: true,
    colorNames: ['Pink', 'Black'],
    featureValues: {
      Materiale: 'Ecopelle',
      Capienza: 'Mini',
      Stile: 'Luxury',
    },
  },
  {
    codeItem: 'PM-KHD-009',
    name: 'Puma Kids Hoodie',
    description: 'Felpa morbida con vestibilità comoda e interno felpato per i più piccoli.',
    category: 'Abbigliamento',
    subCategory: 'Felpe',
    brand: 'Puma',
    gender: 'Bambini',
    price: 42.9,
    rating: 4.3,
    availableQuantity: 20,
    favorite: true,
    promo: true,
    percentualPromo: 10,
    colorNames: ['Blue', 'Red'],
    featureValues: {
      Materiale: 'Cotone',
      Taglia: 'XS',
      Vestibilita: 'Regular',
      Stile: 'Streetwear',
    },
  },
  {
    codeItem: 'GC-OXF-010',
    name: 'Gucci Oxford Shoes',
    description: 'Scarpe eleganti in pelle liscia per occasioni formali e look business.',
    category: 'Scarpe',
    subCategory: 'Eleganti',
    brand: 'Gucci',
    gender: 'Uomo',
    price: 169.9,
    rating: 4.8,
    availableQuantity: 7,
    plus: true,
    colorNames: ['Brown', 'Black'],
    featureValues: {
      Materiale: 'Pelle',
      Numero: '43',
      'Tipo scarpa': 'Elegante',
      Stile: 'Luxury',
    },
  },
  {
    codeItem: 'NB-574-011',
    name: 'New Balance 574',
    description: 'Sneaker lifestyle comoda e leggera, ideale per tutti i giorni.',
    category: 'Scarpe',
    subCategory: 'Sneakers',
    brand: 'New Balance',
    gender: 'Unisex',
    price: 109.9,
    rating: 4.7,
    availableQuantity: 16,
    favorite: true,
    newArrival: true,
    colorNames: ['Grey', 'Blue'],
    featureValues: {
      Materiale: 'Mesh',
      Numero: '41',
      'Tipo scarpa': 'Sneaker',
      Stile: 'Streetwear',
    },
  },
  {
    codeItem: 'LV-DJK-012',
    name: "Levi's Denim Jacket",
    description: 'Giacca in denim dalla mano corposa con taglio regular e finitura vintage.',
    category: 'Abbigliamento',
    subCategory: 'Giacche',
    brand: "Levi's",
    gender: 'Donna',
    price: 98.9,
    rating: 4.5,
    availableQuantity: 11,
    promo: true,
    percentualPromo: 15,
    colorNames: ['Blue', 'Grey'],
    featureValues: {
      Materiale: 'Denim',
      Taglia: 'M',
      Vestibilita: 'Regular',
      Stile: 'Streetwear',
    },
  },
  {
    codeItem: 'CV-CHK-013',
    name: 'Converse Chuck 70',
    description: 'High top iconica con canvas robusto e suola vulcanizzata.',
    category: 'Scarpe',
    subCategory: 'Sneakers',
    brand: 'Converse',
    gender: 'Unisex',
    price: 84.9,
    rating: 4.6,
    availableQuantity: 24,
    colorNames: ['Black', 'White', 'Red'],
    featureValues: {
      Materiale: 'Canvas',
      Numero: '40',
      'Tipo scarpa': 'Sneaker',
      Stile: 'Streetwear',
    },
  },
  {
    codeItem: 'TH-CHN-014',
    name: 'Tommy Chino Pants',
    description: 'Pantalone chino con fit pulito e comfort elastico per uso quotidiano.',
    category: 'Abbigliamento',
    subCategory: 'Pantaloni',
    brand: 'Tommy Hilfiger',
    gender: 'Uomo',
    price: 74.9,
    rating: 4.4,
    availableQuantity: 12,
    colorNames: ['Beige', 'Navy'],
    featureValues: {
      Materiale: 'Cotone',
      Taglia: 'L',
      Vestibilita: 'Slim',
      Stile: 'Classico',
    },
  },
  {
    codeItem: 'NK-WDR-015',
    name: 'Nike Windrunner Set',
    description: 'Completo training leggero con zip frontale e pantalone coordinato.',
    category: 'Sport',
    subCategory: 'Tracksuit',
    brand: 'Nike',
    gender: 'Donna',
    price: 129.9,
    rating: 4.7,
    availableQuantity: 10,
    promo: true,
    percentualPromo: 22,
    plus: true,
    colorNames: ['Black', 'Pink'],
    featureValues: {
      Materiale: 'Poliestere',
      Taglia: 'M',
      Vestibilita: 'Regular',
      Stile: 'Sportivo',
    },
  },
  {
    codeItem: 'AD-GAZ-016',
    name: 'Adidas Gazelle Street',
    description: 'Sneaker rétro con profilo basso e dettagli a contrasto.',
    category: 'Scarpe',
    subCategory: 'Sneakers',
    brand: 'Adidas',
    gender: 'Donna',
    price: 99.9,
    rating: 4.6,
    availableQuantity: 19,
    newArrival: true,
    colorNames: ['Pink', 'White', 'Navy'],
    featureValues: {
      Materiale: 'Canvas',
      Numero: '38',
      'Tipo scarpa': 'Casual',
      Stile: 'Streetwear',
    },
  },
  {
    codeItem: 'RB-BPK-017',
    name: 'Reebok Classic Backpack',
    description: 'Zaino urbano con comparto laptop e tasche organizer frontali.',
    category: 'Borse',
    subCategory: 'Zaini',
    brand: 'Reebok',
    gender: 'Unisex',
    price: 64.9,
    rating: 4.3,
    availableQuantity: 15,
    colorNames: ['Black', 'Grey'],
    featureValues: {
      Materiale: 'Nylon',
      Capienza: 'Media',
      Stile: 'Sportivo',
    },
  },
  {
    codeItem: 'GC-BLT-018',
    name: 'Gucci Leather Belt',
    description: 'Cintura in pelle con fibbia statement e costruzione premium.',
    category: 'Accessori',
    subCategory: 'Cinture',
    brand: 'Gucci',
    gender: 'Uomo',
    price: 149.9,
    rating: 4.8,
    availableQuantity: 9,
    plus: true,
    colorNames: ['Brown', 'Black'],
    featureValues: {
      Materiale: 'Pelle',
      Stile: 'Luxury',
    },
  },
  {
    codeItem: 'NF-BTS-019',
    name: 'The North Face Trek Boots',
    description: 'Boots da trekking con grip profondo e supporto stabile sulla caviglia.',
    category: 'Scarpe',
    subCategory: 'Boots',
    brand: 'The North Face',
    gender: 'Unisex',
    price: 139.9,
    rating: 4.7,
    availableQuantity: 11,
    plus: true,
    colorNames: ['Brown', 'Black'],
    featureValues: {
      Materiale: 'Pelle',
      Numero: '44',
      'Tipo scarpa': 'Trekking',
      Stile: 'Outdoor',
    },
  },
  {
    codeItem: 'VL-CLT-020',
    name: 'Valentino Evening Clutch',
    description: 'Clutch compatta da sera con linee pulite e finitura brillante.',
    category: 'Borse',
    subCategory: 'Tracolle',
    brand: 'Valentino',
    gender: 'Donna',
    price: 189.9,
    rating: 4.7,
    availableQuantity: 5,
    plus: true,
    newArrival: true,
    colorNames: ['Black', 'Beige'],
    featureValues: {
      Materiale: 'Ecopelle',
      Capienza: 'Mini',
      Stile: 'Luxury',
    },
  },
  {
    codeItem: 'LC-DRS-021',
    name: 'Lacoste Tennis Dress',
    description: 'Vestito sportivo leggero con struttura elastica e taglio femminile.',
    category: 'Abbigliamento',
    subCategory: 'Vestiti',
    brand: 'Lacoste',
    gender: 'Donna',
    price: 96.9,
    rating: 4.5,
    availableQuantity: 8,
    newArrival: true,
    colorNames: ['White', 'Green'],
    featureValues: {
      Materiale: 'Cotone',
      Taglia: 'S',
      Vestibilita: 'Slim',
      Stile: 'Sportivo',
    },
  },
  {
    codeItem: 'LV-JNS-022',
    name: "Levi's 501 Jeans",
    description: 'Jeans straight fit dal lavaggio pulito e dal carattere senza tempo.',
    category: 'Abbigliamento',
    subCategory: 'Pantaloni',
    brand: "Levi's",
    gender: 'Uomo',
    price: 89.9,
    rating: 4.6,
    availableQuantity: 17,
    favorite: true,
    colorNames: ['Blue', 'Black'],
    featureValues: {
      Materiale: 'Denim',
      Taglia: 'L',
      Vestibilita: 'Regular',
      Stile: 'Classico',
    },
  },
  {
    codeItem: 'NK-BRA-023',
    name: 'Nike Sports Bra Flow',
    description: 'Top sportivo a medio supporto con tessuto morbido e asciugatura rapida.',
    category: 'Sport',
    subCategory: 'Training',
    brand: 'Nike',
    gender: 'Donna',
    price: 44.9,
    rating: 4.4,
    availableQuantity: 18,
    promo: true,
    percentualPromo: 15,
    colorNames: ['Pink', 'Black'],
    featureValues: {
      Materiale: 'Poliestere',
      Taglia: 'M',
      Vestibilita: 'Slim',
      Stile: 'Sportivo',
    },
  },
  {
    codeItem: 'AD-HDY-024',
    name: 'Adidas Essentials Hoodie',
    description: 'Felpa everyday con cappuccio, tasca marsupio e mano soffice.',
    category: 'Abbigliamento',
    subCategory: 'Felpe',
    brand: 'Adidas',
    gender: 'Uomo',
    price: 64.9,
    rating: 4.5,
    availableQuantity: 20,
    favorite: true,
    newArrival: true,
    colorNames: ['Grey', 'Navy'],
    featureValues: {
      Materiale: 'Cotone',
      Taglia: 'XL',
      Vestibilita: 'Oversize',
      Stile: 'Streetwear',
    },
  },
  {
    codeItem: 'TH-SCF-025',
    name: 'Tommy Wool Scarf',
    description: 'Sciarpa morbida in lana leggera con palette neutra e finitura premium.',
    category: 'Accessori',
    subCategory: 'Sciarpe',
    brand: 'Tommy Hilfiger',
    gender: 'Donna',
    price: 49.9,
    rating: 4.2,
    availableQuantity: 14,
    colorNames: ['Beige', 'Grey'],
    featureValues: {
      Materiale: 'Lana',
      Stile: 'Classico',
    },
  },
  {
    codeItem: 'GC-WTC-026',
    name: 'Gucci Signature Watch',
    description: 'Orologio dal design pulito con cassa minimal e carattere premium.',
    category: 'Accessori',
    subCategory: 'Orologi',
    brand: 'Gucci',
    gender: 'Unisex',
    price: 279.9,
    rating: 4.9,
    availableQuantity: 4,
    favorite: true,
    plus: true,
    colorNames: ['Black', 'Brown'],
    featureValues: {
      Materiale: 'Pelle',
      Stile: 'Luxury',
    },
  },
];

const userSeeds = [
  {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario@example.com',
    address: 'Via Roma 123, Milano',
    number: '3331234567',
    newsletter: true,
    password: 'password123',
    role: Role.USER,
  },
  {
    name: 'Giulia',
    surname: 'Verdi',
    email: 'giulia@example.com',
    address: 'Via Torino 45, Torino',
    number: '3339876543',
    newsletter: true,
    password: 'password456',
    role: Role.USER,
  },
  {
    name: 'Luca',
    surname: 'Bianchi',
    email: 'luca@example.com',
    address: 'Via Mazzini 8, Bologna',
    number: '3312223344',
    newsletter: false,
    password: 'password123',
    role: Role.USER,
  },
  {
    name: 'Sara',
    surname: 'Neri',
    email: 'sara@example.com',
    address: 'Corso Italia 77, Firenze',
    number: '3394556677',
    newsletter: true,
    password: 'password123',
    role: Role.USER,
  },
  {
    name: 'Elena',
    surname: 'Romano',
    email: 'elena@example.com',
    address: 'Via Libertà 56, Palermo',
    number: '3381122334',
    newsletter: true,
    password: 'password123',
    role: Role.USER,
  },
  {
    name: 'Admin',
    surname: 'Store',
    email: 'admin@example.com',
    address: 'Via Admin 1, Roma',
    number: '3300000000',
    newsletter: false,
    password: 'admin123456',
    role: Role.ADMIN,
  },
] as const;

const reviewSeeds = [
  { email: 'mario@example.com', codeItem: 'NK-TEE-001', rating: 5, comment: 'Vestibilità ottima e tessuto davvero piacevole.' },
  { email: 'mario@example.com', codeItem: 'NB-574-011', rating: 5, comment: 'Sneaker comode, perfette per tutto il giorno.' },
  { email: 'giulia@example.com', codeItem: 'VL-BAG-008', rating: 5, comment: 'Mini bag bellissima, finiture curate.' },
  { email: 'giulia@example.com', codeItem: 'LC-DRS-021', rating: 4, comment: 'Vestito leggero, ideale per la stagione calda.' },
  { email: 'luca@example.com', codeItem: 'NF-BTS-019', rating: 5, comment: 'Grip eccellente, usate in montagna senza problemi.' },
  { email: 'luca@example.com', codeItem: 'RB-JKT-004', rating: 4, comment: 'Giacca molto pratica e ben rifinita.' },
  { email: 'sara@example.com', codeItem: 'GC-SHR-005', rating: 5, comment: 'Camicia premium, look elegante e versatile.' },
  { email: 'sara@example.com', codeItem: 'NK-BRA-023', rating: 4, comment: 'Supporto buono e vestibilità confortevole.' },
  { email: 'elena@example.com', codeItem: 'AD-GAZ-016', rating: 4, comment: 'Molto belle dal vivo, colore riuscito.' },
  { email: 'elena@example.com', codeItem: 'TH-SCF-025', rating: 4, comment: 'Sciarpa morbida, ottima idea regalo.' },
  { email: 'giulia@example.com', codeItem: 'GC-WTC-026', rating: 5, comment: 'Orologio elegante, fa davvero scena.' },
  { email: 'mario@example.com', codeItem: 'LV-JNS-022', rating: 4, comment: 'Denim solido, taglio classico ben riuscito.' },
] as const;

const favoriteSeeds = [
  { email: 'mario@example.com', codeItems: ['NK-TEE-001', 'PM-RUN-003', 'NF-BPK-006', 'NB-574-011'] },
  { email: 'giulia@example.com', codeItems: ['AD-LEG-002', 'GC-SHR-005', 'VL-BAG-008', 'LC-DRS-021'] },
  { email: 'luca@example.com', codeItems: ['RB-JKT-004', 'NF-BTS-019', 'LV-JNS-022'] },
  { email: 'sara@example.com', codeItems: ['GC-WTC-026', 'VL-CLT-020', 'NK-BRA-023'] },
  { email: 'elena@example.com', codeItems: ['AD-GAZ-016', 'TH-SCF-025', 'AD-HDY-024'] },
] as const;

const orderSeeds = [
  {
    email: 'mario@example.com',
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.SUCCEEDED,
    paymentIntentId: 'pi_seed_mario_001',
    items: [
      { codeItem: 'NK-TEE-001', quantity: 1 },
      { codeItem: 'NB-574-011', quantity: 1 },
    ],
  },
  {
    email: 'giulia@example.com',
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PROCESSING,
    paymentIntentId: 'pi_seed_giulia_001',
    items: [
      { codeItem: 'VL-BAG-008', quantity: 1 },
      { codeItem: 'AD-LEG-002', quantity: 1 },
    ],
  },
  {
    email: 'luca@example.com',
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentIntentId: null,
    items: [
      { codeItem: 'NF-BTS-019', quantity: 1 },
    ],
  },
  {
    email: 'sara@example.com',
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.SUCCEEDED,
    paymentIntentId: 'pi_seed_sara_001',
    items: [
      { codeItem: 'GC-WTC-026', quantity: 1 },
      { codeItem: 'TH-SCF-025', quantity: 1 },
      { codeItem: 'LV-JNS-022', quantity: 1 },
    ],
  },
] as const;

const checkoutSessionSeeds = [
  {
    email: 'elena@example.com',
    status: CheckoutStatus.OPEN,
    paymentStatus: PaymentStatus.PENDING,
    items: [
      { codeItem: 'AD-GAZ-016', quantity: 1 },
      { codeItem: 'TH-SCF-025', quantity: 1 },
    ],
  },
  {
    email: 'mario@example.com',
    status: CheckoutStatus.PAYMENT_PENDING,
    paymentStatus: PaymentStatus.REQUIRES_ACTION,
    items: [
      { codeItem: 'GC-BLT-018', quantity: 1 },
      { codeItem: 'RB-BPK-017', quantity: 1 },
    ],
  },
] as const;

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function buildSeedImageUrl(seed: string, width = 900, height = 1200) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

async function resetDatabase() {
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.checkoutSessionItem.deleteMany();
  await prisma.checkoutSession.deleteMany();
  await prisma.orderProduct.deleteMany();
  await prisma.order.deleteMany();
  await prisma.token.deleteMany();
  await prisma.resetToken.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productFeature.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.categoryImage.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.gender.deleteMany();
  await prisma.color.deleteMany();
}

async function createColors() {
  const records = new Map<string, { id: number; name: string; hex: string | null }>();

  for (const color of colorSeeds) {
    const created = await prisma.color.create({ data: color });
    records.set(created.name, created);
  }

  return records;
}

async function createBrands() {
  const records = new Map<string, { id: number; name: string }>();

  for (const name of brandSeeds) {
    const created = await prisma.brand.create({ data: { name } });
    records.set(created.name, created);
  }

  return records;
}

async function createGenders() {
  const records = new Map<string, { id: number; name: string }>();

  for (const name of genderSeeds) {
    const created = await prisma.gender.create({ data: { name } });
    records.set(created.name, created);
  }

  return records;
}

async function createCategories(genderMap: Map<string, { id: number }>) {
  const categoryMap = new Map<string, { id: number; name: string }>();
  const subCategoryMap = new Map<string, { id: number; name: string; categoryId: number }>();

  for (const categorySeed of categorySeeds) {
    const category = await prisma.category.create({
      data: { name: categorySeed.name },
    });

    categoryMap.set(category.name, category);

    for (const subCategoryName of categorySeed.subCategories) {
      const subCategory = await prisma.subCategory.create({
        data: {
          name: subCategoryName,
          categoryId: category.id,
        },
      });

      subCategoryMap.set(`${category.name}:${subCategory.name}`, subCategory);
    }
  }

  const categoryImages = Array.from(categoryMap.values()).flatMap((category) =>
    ['Uomo', 'Donna', 'Bambini'].map((genderName) => ({
      categoryId: category.id,
      genderId: genderMap.get(genderName)?.id ?? 0,
      imageUrl: buildSeedImageUrl(`category-${slugify(category.name)}-${slugify(genderName)}`, 1400, 1000),
    }))
  );

  await prisma.categoryImage.createMany({ data: categoryImages });

  return { categoryMap, subCategoryMap };
}

async function createFeatures(categoryMap: Map<string, { id: number }>) {
  const featureMap = new Map<string, { id: number; name: string }>();

  for (const featureSeed of featureSeeds) {
    const categoryId = featureSeed.category ? categoryMap.get(featureSeed.category)?.id : undefined;
    const created = await prisma.feature.create({
      data: {
        name: featureSeed.name,
        type: featureSeed.type,
        options: JSON.stringify(featureSeed.options),
        categoryId,
      },
    });

    featureMap.set(created.name, created);
  }

  return featureMap;
}

function buildProductPhoto(codeItem: string, colorName: string) {
  return buildSeedImageUrl(`product-${slugify(codeItem)}-${slugify(colorName)}-main`, 1200, 1400);
}

function buildProductImages(
  productId: number,
  codeItem: string,
  colorNames: string[],
  colorMap: Map<string, { id: number }>
) {
  const productSlug = slugify(codeItem);
  const images = [];

  for (const [index, colorName] of colorNames.entries()) {
    const color = colorMap.get(colorName);

    if (!color) {
      throw new Error(`Colore non trovato per il prodotto ${codeItem}: ${colorName}`);
    }

    images.push(
      {
        productId,
        colorId: color.id,
        imageUrl: buildSeedImageUrl(`product-${productSlug}-${slugify(colorName)}-main`, 1200, 1400),
        imageType: ImageType.MAIN,
        sortOrder: index * 10,
      },
      {
        productId,
        colorId: color.id,
        imageUrl: buildSeedImageUrl(`product-${productSlug}-${slugify(colorName)}-detail-1`, 1200, 1400),
        imageType: ImageType.SECONDARY,
        sortOrder: index * 10 + 1,
      },
      {
        productId,
        colorId: color.id,
        imageUrl: buildSeedImageUrl(`product-${productSlug}-${slugify(colorName)}-detail-2`, 1200, 1400),
        imageType: ImageType.SECONDARY,
        sortOrder: index * 10 + 2,
      }
    );
  }

  images.push(
    {
      productId,
      colorId: null,
      imageUrl: buildSeedImageUrl(`product-${productSlug}-general-1`, 1200, 1200),
      imageType: ImageType.GENERAL,
      sortOrder: 100,
    },
    {
      productId,
      colorId: null,
      imageUrl: buildSeedImageUrl(`product-${productSlug}-general-2`, 1200, 1200),
      imageType: ImageType.GENERAL,
      sortOrder: 101,
    }
  );

  return images;
}

async function createProducts(
  categoryMap: Map<string, { id: number }>,
  subCategoryMap: Map<string, { id: number }>,
  brandMap: Map<string, { id: number }>,
  genderMap: Map<string, { id: number }>,
  featureMap: Map<string, { id: number }>,
  colorMap: Map<string, { id: number }>
) {
  const productMap = new Map<string, { id: number; codeItem: string; price: number; photo: string; name: string }>();

  for (const seed of productSeeds) {
    const category = categoryMap.get(seed.category);
    const subCategory = subCategoryMap.get(`${seed.category}:${seed.subCategory}`);
    const brand = brandMap.get(seed.brand);
    const gender = genderMap.get(seed.gender);

    if (!category || !subCategory || !brand || !gender) {
      throw new Error(`Relazioni mancanti per il prodotto ${seed.codeItem}`);
    }

    const photo = buildProductPhoto(seed.codeItem, seed.colorNames[0]);

    const product = await prisma.product.create({
      data: {
        name: seed.name,
        description: seed.description,
        categoryId: category.id,
        subCategoryId: subCategory.id,
        brandId: brand.id,
        genderId: gender.id,
        price: seed.price,
        rating: seed.rating,
        available_quantity: seed.availableQuantity,
        favorite: seed.favorite ?? false,
        promo: seed.promo ?? false,
        percentualPromo: seed.promo ? seed.percentualPromo ?? 10 : 0,
        plus: seed.plus ?? false,
        newArrival: seed.newArrival ?? false,
        photo,
        codeItem: seed.codeItem,
        features: {
          create: Object.entries(seed.featureValues).map(([featureName, value]) => {
            const feature = featureMap.get(featureName);

            if (!feature) {
              throw new Error(`Feature non trovata: ${featureName}`);
            }

            return {
              featureId: feature.id,
              value,
            };
          }),
        },
      },
    });

    await prisma.productColor.createMany({
      data: seed.colorNames.map((colorName) => {
        const color = colorMap.get(colorName);

        if (!color) {
          throw new Error(`Colore non trovato: ${colorName}`);
        }

        return {
          productId: product.id,
          colorId: color.id,
        };
      }),
    });

    await prisma.productImage.createMany({
      data: buildProductImages(product.id, seed.codeItem, seed.colorNames, colorMap),
    });

    productMap.set(seed.codeItem, {
      id: product.id,
      codeItem: product.codeItem,
      price: product.price,
      photo: product.photo,
      name: product.name,
    });
  }

  return productMap;
}

async function createUsers() {
  const userMap = new Map<
    string,
    {
      id: number;
      email: string;
      name: string | null;
      surname: string | null;
      address: string | null;
      number: string | null;
      role: Role;
    }
  >();

  for (const seed of userSeeds) {
    const password = await bcrypt.hash(seed.password, 10);
    const user = await prisma.user.create({
      data: {
        name: seed.name,
        surname: seed.surname,
        email: seed.email,
        address: seed.address,
        number: seed.number,
        newsletter: seed.newsletter,
        password,
        role: seed.role,
      },
    });

    userMap.set(user.email, user);
  }

  return userMap;
}

async function createFavorites(
  userMap: Map<string, { id: number }>,
  productMap: Map<string, { id: number }>
) {
  const favorites = favoriteSeeds.flatMap((seed) => {
    const user = userMap.get(seed.email);

    if (!user) {
      throw new Error(`Utente preferiti non trovato: ${seed.email}`);
    }

    return seed.codeItems.map((codeItem) => {
      const product = productMap.get(codeItem);

      if (!product) {
        throw new Error(`Prodotto preferiti non trovato: ${codeItem}`);
      }

      return {
        userId: user.id,
        productId: product.id,
      };
    });
  });

  await prisma.favorite.createMany({ data: favorites });
}

async function createReviews(
  userMap: Map<string, { id: number }>,
  productMap: Map<string, { id: number }>
) {
  await prisma.review.createMany({
    data: reviewSeeds.map((seed, index) => {
      const user = userMap.get(seed.email);
      const product = productMap.get(seed.codeItem);

      if (!user || !product) {
        throw new Error(`Recensione non valida per ${seed.email} / ${seed.codeItem}`);
      }

      return {
        userId: user.id,
        productId: product.id,
        rating: seed.rating,
        comment: seed.comment,
        createdAt: new Date(Date.now() - index * 86_400_000),
      };
    }),
  });
}

async function createOrders(
  userMap: Map<string, { id: number; name: string | null; surname: string | null; email: string; address: string | null; number: string | null }>,
  productMap: Map<string, { id: number; price: number }>
) {
  let orderIndex = 0;

  for (const seed of orderSeeds) {
    const user = userMap.get(seed.email);

    if (!user) {
      throw new Error(`Utente ordine non trovato: ${seed.email}`);
    }

    const items = seed.items.map((item) => {
      const product = productMap.get(item.codeItem);

      if (!product) {
        throw new Error(`Prodotto ordine non trovato: ${item.codeItem}`);
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    const subtotal = roundCurrency(
      items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    );
    const shippingAmount = subtotal >= 120 ? 0 : 7.9;
    const totalAmount = roundCurrency(subtotal + shippingAmount);

    const order = await prisma.order.create({
      data: {
        idUtente: user.id,
        price: totalAmount,
        subtotal,
        shippingAmount,
        currency: 'eur',
        status: seed.status,
        paymentStatus: seed.paymentStatus,
        paymentIntentId: seed.paymentIntentId,
        customerName: user.name,
        customerSurname: user.surname,
        customerEmail: user.email,
        shippingAddress: user.address,
        customerPhone: user.number,
        paidAt: seed.paymentStatus === PaymentStatus.SUCCEEDED ? new Date(Date.now() - orderIndex * 43_200_000) : null,
      },
    });

    await prisma.orderProduct.createMany({
      data: items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    orderIndex += 1;
  }
}

async function createCheckoutSessions(
  userMap: Map<string, { id: number; name: string | null; surname: string | null; email: string; address: string | null; number: string | null }>,
  productMap: Map<string, { id: number; price: number; name: string; photo: string }>
) {
  for (const [index, seed] of checkoutSessionSeeds.entries()) {
    const user = userMap.get(seed.email);

    if (!user) {
      throw new Error(`Utente checkout non trovato: ${seed.email}`);
    }

    const items = seed.items.map((item) => {
      const product = productMap.get(item.codeItem);

      if (!product) {
        throw new Error(`Prodotto checkout non trovato: ${item.codeItem}`);
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        productName: product.name,
        productPhoto: product.photo,
      };
    });

    const subtotal = roundCurrency(
      items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    );
    const shippingAmount = subtotal >= 120 ? 0 : 7.9;
    const totalAmount = roundCurrency(subtotal + shippingAmount);

    await prisma.checkoutSession.create({
      data: {
        userId: user.id,
        customerName: user.name || 'Cliente',
        customerSurname: user.surname || 'Seed',
        customerEmail: user.email,
        shippingAddress: user.address || 'Indirizzo seed',
        customerPhone: user.number || '0000000000',
        currency: 'eur',
        subtotal,
        shippingAmount,
        totalAmount,
        status: seed.status,
        paymentStatus: seed.paymentStatus,
        expiresAt: new Date(Date.now() + (index + 1) * 86_400_000),
        items: {
          create: items,
        },
      },
    });
  }
}

async function main() {
  await resetDatabase();

  const colorMap = await createColors();
  const brandMap = await createBrands();
  const genderMap = await createGenders();
  const { categoryMap, subCategoryMap } = await createCategories(genderMap);
  const featureMap = await createFeatures(categoryMap);
  const productMap = await createProducts(
    categoryMap,
    subCategoryMap,
    brandMap,
    genderMap,
    featureMap,
    colorMap
  );
  const userMap = await createUsers();

  await createFavorites(userMap, productMap);
  await createReviews(userMap, productMap);
  await createOrders(userMap, productMap);
  await createCheckoutSessions(userMap, productMap);

  console.log(`✅ Seeder completato con successo:
- ${colorSeeds.length} colori
- ${brandSeeds.length} brand
- ${categorySeeds.length} categorie
- ${productSeeds.length} prodotti con gallery immagini
- ${userSeeds.length} utenti
- ${reviewSeeds.length} recensioni
- ${orderSeeds.length} ordini
- ${checkoutSessionSeeds.length} checkout draft`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Errore durante l\'esecuzione del seeder:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
