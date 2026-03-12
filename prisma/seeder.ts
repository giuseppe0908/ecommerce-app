import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ===================== COLORI =====================
  const red = await prisma.color.create({ data: { name: 'Red', hex: '#FF0000' } });
  const blue = await prisma.color.create({ data: { name: 'Blue', hex: '#0000FF' } });
  const black = await prisma.color.create({ data: { name: 'Black', hex: '#000000' } });
  const white = await prisma.color.create({ data: { name: 'White', hex: '#FFFFFF' } });
  const green = await prisma.color.create({ data: { name: 'Green', hex: '#00FF00' } });

  // ===================== CATEGORIE E SUB CATEGORIE=====================
  const casual = await prisma.category.create({ data: { name: 'Casuale' } });
  const sport = await prisma.category.create({ data: { name: 'Sport' } });
  const formale = await prisma.category.create({ data: { name: 'Formale' } });
  const outdoor = await prisma.category.create({ data: { name: 'Esterno' } });
  const scarpe = await prisma.category.create({ data: { name: 'Scarpe' } });
  const borse = await prisma.category.create({ data: { name: 'Borse' } });
  const accessori = await prisma.category.create({ data: { name: 'Accessori' } });
  const _promo = await prisma.category.create({ data: { name: 'Promo' } });
  const abbigliamento = await prisma.category.create({ data: { name: 'Abbigliamento' } });

  const camicia = await prisma.subCategory.create({
    data: { name: 'Camice', categoryId: formale.id },
  });

  const sportt = await prisma.subCategory.create({
    data: { name: 'Sport', categoryId: sport.id },
  });

  const orologi = await prisma.subCategory.create({
    data: { name: 'Orologi', categoryId: accessori.id },
  });

  const _gioielli = await prisma.subCategory.create({
    data: { name: 'Gioielli', categoryId: accessori.id },
  });

  const felpe = await prisma.subCategory.create({
    data: { name: 'Felpe', categoryId: casual.id },
  });

  const giacca = await prisma.subCategory.create({
    data: { name: 'Giacche', categoryId: formale.id },
  });


  // ===================== BRAND =====================
  const nike = await prisma.brand.create({ data: { name: 'Nike' } });
  const adidas = await prisma.brand.create({ data: { name: 'Adidas' } });
  const puma = await prisma.brand.create({ data: { name: 'Puma' } });
  const reebok = await prisma.brand.create({ data: { name: 'Reebok' } });
  const gucci = await prisma.brand.create({ data: { name: 'Gucci' } });

  // ===================== GENERI =====================
  const uomo = await prisma.gender.create({ data: { name: 'Uomo' } });
  const donna = await prisma.gender.create({ data: { name: 'Donna' } });
  const bambini = await prisma.gender.create({ data: { name: 'Bambini' } });
  const unisex = await prisma.gender.create({ data: { name: 'Unisex' } });

  // ===================== FEATURES PER CATEGORIA =====================
  const materiale = await prisma.feature.create({
    data: {
      name: 'Materiale',
      type: 'select',
      options: JSON.stringify(['Cotone', 'Poliestere']), 
      categoryId: abbigliamento.id,
    },
  });

  const taglia = await prisma.feature.create({
    data: {
      name: 'Taglia',
      type: 'select',
      options: JSON.stringify(['S', 'M', 'L', 'XL']),
      categoryId: abbigliamento.id,
    },
  });

  const numero = await prisma.feature.create({
    data: {
      name: 'Numero',
      type: 'select',
      options: JSON.stringify(['40', '41', '42']),
      categoryId: scarpe.id,
    },
  });

  const tipoScarpa = await prisma.feature.create({
    data: {
      name: 'Tipo',
      type: 'select',
      options: JSON.stringify(['Running', 'Casual', 'Elegante']),
      categoryId: scarpe.id,
    },
  });

  // ===================== IMMAGINI CATEGORIE =====================
  await prisma.categoryImage.createMany({
    data: [
      { imageUrl: 'https://images.pexels.com/photos/1006918/pexels-photo-1006918.jpeg', genderId: uomo.id, categoryId: casual.id },
      { imageUrl: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg', genderId: donna.id, categoryId: casual.id },
      { imageUrl: 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg', genderId: bambini.id, categoryId: casual.id },
      { imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', genderId: uomo.id, categoryId: sport.id },
      { imageUrl: 'https://images.pexels.com/photos/1059143/pexels-photo-1059143.jpeg', genderId: donna.id, categoryId: sport.id },
      { imageUrl: 'https://images.pexels.com/photos/1567423/pexels-photo-1567423.jpeg', genderId: uomo.id, categoryId: formale.id },
      { imageUrl: 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg', genderId: donna.id, categoryId: formale.id },
      { imageUrl: 'https://images.pexels.com/photos/935835/pexels-photo-935835.jpeg', genderId: uomo.id, categoryId: outdoor.id },
      { imageUrl: 'https://images.pexels.com/photos/1534922/pexels-photo-1534922.jpeg', genderId: bambini.id, categoryId: outdoor.id },
      { imageUrl: 'https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg', genderId: uomo.id, categoryId: scarpe.id },
      { imageUrl: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg', genderId: donna.id, categoryId: scarpe.id },
    ],
  });

  // ===================== PRODOTTI CON SOTTOCATEGORIE E FEATURES =====================
  const products = [
    // Prodotto 1: Maglietta Nike
    await prisma.product.create({
      data: {
        name: 'Maglietta Nike',
        categoryId: abbigliamento.id,
        subCategoryId: camicia.id,
        brandId: nike.id,
        genderId: uomo.id,
        price: 29.99,
        promo: true,
        percentualPromo: 20,
        rating: 4.0,
        available_quantity: 5,
        plus: false,
        newArrival: true,
        photo: 'https://images.pexels.com/photos/4041689/pexels-photo-4041689.jpeg',
        codeItem: 'NK1234',
        description: 'Maglietta comoda e traspirante, ideale per un look casual.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Cotone' },
            { featureId: taglia.id, value: 'M' }
          ]
        }
      },
    }),
    // Prodotto 2: Pantaloni Sportivi Adidas
    await prisma.product.create({
      data: {
        name: 'Pantaloni Sportivi Adidas',
        categoryId: abbigliamento.id,
        subCategoryId: sportt.id,
        brandId: adidas.id,
        genderId: donna.id,
        price: 49.99,
        promo: true,
        percentualPromo: 20,
        rating: 4.0,
        available_quantity: 5,
        plus: false,
        newArrival: true,
        photo: 'https://images.pexels.com/photos/2430671/pexels-photo-2430671.jpeg',
        codeItem: 'AD5678',
        description: 'Pantaloni sportivi elasticizzati per allenamenti intensi.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Poliestere' },
            { featureId: taglia.id, value: 'L' }
          ]
        }
      },
    }),
    // Prodotto 3: Scarpe da Corsa Puma
    await prisma.product.create({
      data: {
        name: 'Scarpe da Corsa Puma',
        categoryId: scarpe.id,
        subCategoryId: sportt.id,
        brandId: puma.id,
        genderId: uomo.id,
        price: 89.99,
        promo: true,
        percentualPromo: 20,
        rating: 4.0,
        available_quantity: 5,
        plus: false,
        newArrival: true,
        photo: 'https://images.pexels.com/photos/267242/pexels-photo-267242.jpeg',
        codeItem: 'PM1122',
        description: 'Scarpe leggere e ammortizzate per la corsa.',
        features: {
          create: [
            { featureId: numero.id, value: '42' },
            { featureId: tipoScarpa.id, value: 'Running' }
          ]
        }
      },
    }),
    // Prodotto 4: Giacca Reebok
    await prisma.product.create({
      data: {
        name: 'Giacca Reebok',
        categoryId: outdoor.id,
        subCategoryId: giacca.id,
        brandId: reebok.id,
        genderId: bambini.id,
        price: 99.99,
        favorite: true,
        promo: false,
        percentualPromo: 0,
        rating: 4.0,
        available_quantity: 1,
        plus: true,
        newArrival: false,
        photo: 'https://images.pexels.com/photos/2112644/pexels-photo-2112644.jpeg',
        codeItem: 'RB3344',
        description: 'Giacca calda e resistente, perfetta per le avventure all’aperto.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Nylon' },
            { featureId: taglia.id, value: 'XS' }
          ]
        }
      },
    }),
    // Prodotto 5: Camicia Gucci
    await prisma.product.create({
      data: {
        name: 'Camicia Gucci',
        categoryId: abbigliamento.id,
        subCategoryId: camicia.id,
        brandId: gucci.id,
        genderId: donna.id,
        price: 120.0,
        favorite: false,
        promo: true,
        plus: true,
        newArrival: false,
        photo: 'https://images.pexels.com/photos/1493088/pexels-photo-1493088.jpeg',
        codeItem: 'GC5566',
        percentualPromo: 30,
        rating: 4.9,
        available_quantity: 2,
        description: 'Camicia elegante in cotone di alta qualità.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Cotone' },
            { featureId: taglia.id, value: 'S' }
          ]
        }
      },
    }),
    // Prodotto 6: Zaino Outdoor
    await prisma.product.create({
      data: {
        name: 'Zaino Outdoor',
        categoryId: outdoor.id,
        subCategoryId: sportt.id, 
        brandId: reebok.id,
        genderId: unisex.id,
        price: 59.99,
        plus: false,
        newArrival: true,
        photo: 'https://images.pexels.com/photos/2112908/pexels-photo-2112908.jpeg',
        codeItem: 'OU7766',
        promo: true,
        percentualPromo: 15,
        rating: 4.6,
        available_quantity: 8,
        description: 'Zaino capiente e resistente per le avventure outdoor.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Nylon' },
          ]
        }
      },
    }),
    // Prodotto 7: Polo Ralph Lauren
    await prisma.product.create({
      data: {
        name: 'Polo Ralph Lauren',
        categoryId: abbigliamento.id,
        subCategoryId: camicia.id,
        brandId: gucci.id,
        genderId: uomo.id,
        price: 80.0,
        favorite: false,
        promo: false,
        plus: true,
        newArrival: false,
        photo: 'https://images.pexels.com/photos/1513023/pexels-photo-1513023.jpeg',
        codeItem: 'RL7890',
        percentualPromo: 0,
        rating: 4.7,
        available_quantity: 1,
        description: 'Polo in cotone di alta qualità per un look casual e sofisticato.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Cotone' },
            { featureId: taglia.id, value: 'M' }
          ]
        }
      },
    }),
    // Prodotto 8: Borsetta a Tracolla
    await prisma.product.create({
      data: {
        name: 'Borsetta a Tracolla',
        categoryId: borse.id,
        subCategoryId: orologi.id,
        brandId: gucci.id,
        genderId: donna.id,
        price: 199.99,
        favorite: true,
        promo: false,
        plus: true,
        newArrival: true,
        photo: 'https://images.pexels.com/photos/179909/pexels-photo-179909.jpeg',
        codeItem: 'BG0987',
        percentualPromo: 0,
        rating: 4.9,
        available_quantity: 4,
        description: 'Borsetta elegante e pratica, perfetta per le uscite.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Pelle' },
          ]
        }
      },
    }),
    // Prodotto 9: Felpa Puma
    await prisma.product.create({
      data: {
        name: 'Felpa Puma',
        categoryId: abbigliamento.id,
        subCategoryId: felpe.id,
        brandId: puma.id,
        genderId: bambini.id,
        price: 45.99,
        favorite: true,
        promo: true,
        plus: false,
        newArrival: false,
        photo: 'https://images.pexels.com/photos/197845/pexels-photo-197845.jpeg',
        codeItem: 'PU5673',
        percentualPromo: 15,
        rating: 4.4,
        available_quantity: 6,
        description: 'Felpa calda e confortevole, ideale per i più piccoli.',
        features: {
          create: [
            { featureId: materiale.id, value: 'Cotone' },
            { featureId: taglia.id, value: 'XS' }
          ]
        }
      },
    }),
    // Prodotto 10: Scarpe Eleganti Uomo
    await prisma.product.create({
      data: {
        name: 'Scarpe Eleganti Uomo',
        categoryId: scarpe.id,
        subCategoryId: sportt.id,
        brandId: gucci.id,
        genderId: uomo.id,
        price: 150.0,
        favorite: false,
        promo: false,
        plus: true,
        newArrival: true,
        photo: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg',
        codeItem: 'SE3245',
        percentualPromo: 20,
        rating: 4.8,
        available_quantity: 9,
        description: 'Scarpe eleganti in pelle, perfette per un look formale.',
        features: {
          create: [
            { featureId: numero.id, value: '43' },
            { featureId: tipoScarpa.id, value: 'Elegante' }
          ]
        }
      },
    }),
  ];

  // ===================== ASSOCIAZIONE COLORI =====================
  await prisma.productColor.createMany({
    data: [
      // Mappatura migliorata per evitare errori
      { productId: products[0].id, colorId: red.id },
      { productId: products[0].id, colorId: black.id },
      { productId: products[1].id, colorId: blue.id },
      { productId: products[1].id, colorId: white.id },
      { productId: products[2].id, colorId: white.id },
      { productId: products[2].id, colorId: green.id },
      { productId: products[3].id, colorId: black.id },
      { productId: products[3].id, colorId: red.id },
      { productId: products[4].id, colorId: white.id },
      { productId: products[4].id, colorId: blue.id },
      { productId: products[5].id, colorId: green.id },
      { productId: products[5].id, colorId: black.id },
      { productId: products[6].id, colorId: blue.id },
      { productId: products[6].id, colorId: white.id },
      { productId: products[7].id, colorId: black.id },
      { productId: products[7].id, colorId: red.id },
      { productId: products[8].id, colorId: red.id },
      { productId: products[8].id, colorId: blue.id },
      { productId: products[9].id, colorId: black.id },
      { productId: products[9].id, colorId: green.id },
    ],
  });


  // ===================== UTENTI =====================
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password456', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario@example.com',
        address: 'Via Roma 123',
        number: '123456789',
        password: hashedPassword1,
      }
    }),
    prisma.user.create({
      data: {
        name: 'Giulia',
        surname: 'Verdi',
        email: 'giulia@example.com',
        address: 'Via Roma 123',
        number: '123456789',
        password: hashedPassword2,
      }
    })
  ]);

  // ===================== PREFERITI =====================
  // Aggiungi alcuni prodotti ai preferiti per gli utenti
  await prisma.favorite.createMany({
    data: [
      // Preferiti per Mario
      { userId: users[0].id, productId: products[0].id }, // Maglietta Nike
      { userId: users[0].id, productId: products[2].id }, // Scarpe da Corsa Puma
      { userId: users[0].id, productId: products[5].id }, // Zaino Outdoor
      
      // Preferiti per Giulia
      { userId: users[1].id, productId: products[1].id }, // Pantaloni Sportivi Adidas
      { userId: users[1].id, productId: products[4].id }, // Camicia Gucci
      { userId: users[1].id, productId: products[7].id }, // Borsetta a Tracolla
    ],
  });
  
  console.log('✅ Seeder completato con successo!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Errore durante l'esecuzione del seeder:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
