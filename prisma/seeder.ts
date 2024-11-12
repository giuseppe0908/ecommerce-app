import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Aggiungi categorie
  const casual = await prisma.category.create({ data: { name: 'Casuale' } });
  const sport = await prisma.category.create({ data: { name: 'Sport' } });
  const formale = await prisma.category.create({ data: { name: 'Formale' } });
  const outdoor = await prisma.category.create({ data: { name: 'Esterno' } });
  const scarpe = await prisma.category.create({ data: { name: 'Scarpe' } });
  const borse = await prisma.category.create({ data: { name: 'Borse' } });
  const accessori = await prisma.category.create({ data: { name: 'Accessori' } });

  // Aggiungi brand
  const nike = await prisma.brand.create({ data: { name: 'Nike' } });
  const adidas = await prisma.brand.create({ data: { name: 'Adidas' } });
  const puma = await prisma.brand.create({ data: { name: 'Puma' } });
  const reebok = await prisma.brand.create({ data: { name: 'Reebok' } });
  const gucci = await prisma.brand.create({ data: { name: 'Gucci' } });

  // Aggiungi generi
  const uomo = await prisma.gender.create({ data: { name: 'Uomo' } });
  const donna = await prisma.gender.create({ data: { name: 'Donna' } });
  const bambini = await prisma.gender.create({ data: { name: 'Bambini' } });
  const unisex = await prisma.gender.create({ data: { name: 'Unisex' } });

  // Aggiungi immagini per categoria e genere
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

  // Aggiungi prodotti con immagini
  await prisma.product.createMany({
    data: [
      {
        name: 'Maglietta Nike',
        categoryId: casual.id,
        brandId: nike.id,
        genderId: uomo.id,
        favorite: true,
        promo: false,
        plus: true,
        newArrival: true,
        price: 29.99,
        photo: 'https://images.pexels.com/photos/4041689/pexels-photo-4041689.jpeg',
        codeItem: 'NK1234',
        percentualPromo: 10,
        rating: 4.5,
        description: 'Maglietta comoda e traspirante, ideale per un look casual.',
      },
      {
        name: 'Pantaloni Sportivi Adidas',
        categoryId: sport.id,
        brandId: adidas.id,
        genderId: donna.id,
        favorite: false,
        promo: true,
        plus: false,
        newArrival: false,
        price: 49.99,
        photo: 'https://images.pexels.com/photos/2430671/pexels-photo-2430671.jpeg',
        codeItem: 'AD5678',
        percentualPromo: 20,
        rating: 4.0,
        description: 'Pantaloni sportivi per attività fisica con tessuto elastico.',
      },
      {
        name: 'Scarpe da Corsa Puma',
        categoryId: scarpe.id,
        brandId: puma.id,
        genderId: uomo.id,
        favorite: false,
        promo: false,
        plus: false,
        newArrival: true,
        price: 89.99,
        photo: 'https://images.pexels.com/photos/267242/pexels-photo-267242.jpeg',
        codeItem: 'PM1122',
        percentualPromo: 15,
        rating: 4.8,
        description: 'Scarpe leggere e ammortizzate per la corsa.',
      },
      {
        name: 'Giacca Reebok',
        categoryId: outdoor.id,
        brandId: reebok.id,
        genderId: bambini.id,
        favorite: true,
        promo: true,
        plus: true,
        newArrival: false,
        price: 99.99,
        photo: 'https://images.pexels.com/photos/2112644/pexels-photo-2112644.jpeg',
        codeItem: 'RB3344',
        percentualPromo: 25,
        rating: 4.2,
        description: 'Giacca calda e resistente, perfetta per le avventure all’aperto.',
      },
      {
        name: 'Camicia Gucci',
        categoryId: formale.id,
        brandId: gucci.id,
        genderId: donna.id,
        favorite: false,
        promo: true,
        plus: true,
        newArrival: false,
        price: 120.0,
        photo: 'https://images.pexels.com/photos/1493088/pexels-photo-1493088.jpeg',
        codeItem: 'GC5566',
        percentualPromo: 30,
        rating: 4.9,
        description: 'Camicia elegante in cotone di alta qualità.',
      },
      {
        name: 'Zaino Outdoor',
        categoryId: outdoor.id,
        brandId: reebok.id,
        genderId: unisex.id,
        favorite: true,
        promo: false,
        plus: false,
        newArrival: true,
        price: 59.99,
        photo: 'https://images.pexels.com/photos/2112908/pexels-photo-2112908.jpeg',
        codeItem: 'OU7766',
        percentualPromo: 15,
        rating: 4.6,
        description: 'Zaino capiente e resistente per le avventure outdoor.',
      },
      {
        name: 'Polo Ralph Lauren',
        categoryId: casual.id,
        brandId: gucci.id,
        genderId: uomo.id,
        favorite: false,
        promo: true,
        plus: true,
        newArrival: false,
        price: 80.0,
        photo: 'https://images.pexels.com/photos/1513023/pexels-photo-1513023.jpeg',
        codeItem: 'RL7890',
        percentualPromo: 25,
        rating: 4.7,
        description: 'Polo in cotone di alta qualità per un look casual e sofisticato.',
      },
      {
        name: 'Borsetta a Tracolla',
        categoryId: borse.id,
        brandId: gucci.id,
        genderId: donna.id,
        favorite: true,
        promo: true,
        plus: true,
        newArrival: true,
        price: 199.99,
        photo: 'https://images.pexels.com/photos/179909/pexels-photo-179909.jpeg',
        codeItem: 'BG0987',
        percentualPromo: 10,
        rating: 4.9,
        description: 'Borsetta elegante e pratica, perfetta per le uscite.',
      },
      {
        name: 'Felpa Puma',
        categoryId: casual.id,
        brandId: puma.id,
        genderId: bambini.id,
        favorite: true,
        promo: true,
        plus: false,
        newArrival: false,
        price: 45.99,
        photo: 'https://images.pexels.com/photos/197845/pexels-photo-197845.jpeg',
        codeItem: 'PU5673',
        percentualPromo: 15,
        rating: 4.4,
        description: 'Felpa calda e confortevole, ideale per i più piccoli.',
      },
      {
        name: 'Scarpe Eleganti Uomo',
        categoryId: scarpe.id,
        brandId: gucci.id,
        genderId: uomo.id,
        favorite: false,
        promo: false,
        plus: true,
        newArrival: true,
        price: 150.0,
        photo: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg',
        codeItem: 'SE3245',
        percentualPromo: 20,
        rating: 4.8,
        description: 'Scarpe eleganti in pelle, perfette per un look formale.',
      },
    ],
  });

  // Hasheremo le password prima di salvarle nel database
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password456', 10);

  // Aggiungi utenti con password hashate
  const user1 = await prisma.user.create({
    data: {
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario@example.com',
      password: hashedPassword1,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Giulia',
      surname: 'Verdi',
      email: 'giulia@example.com',
      password: hashedPassword2,
    },
  });

  // Aggiungi un ordine per l'utente Mario Rossi
  await prisma.order.create({
    data: {
      idUtente: user1.id,
      codeId: 'ORD123',
      price: 79.98,
    },
  });
}

main()
  .then(async () => {
    console.log('Seeder eseguito con successo');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Errore durante l'esecuzione del seeder:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
