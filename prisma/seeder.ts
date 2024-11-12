import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Aggiungi categorie
  const casual = await prisma.category.create({ data: { name: 'Casuale' } })
  const sport = await prisma.category.create({ data: { name: 'Sport' } })
  const formale = await prisma.category.create({ data: { name: 'Formale' } })
  const outdoor = await prisma.category.create({ data: { name: 'Esterno' } })
  const scarpe = await prisma.category.create({ data: { name: 'Scarpe' } })
  const borse = await prisma.category.create({ data: { name: 'Borse' } })
  const accessori = await prisma.category.create({ data: { name: 'Accessori' } })

  // Aggiungi brand
  const nike = await prisma.brand.create({ data: { name: 'Nike' } })
  const adidas = await prisma.brand.create({ data: { name: 'Adidas' } })
  const puma = await prisma.brand.create({ data: { name: 'Puma' } })
  const reebok = await prisma.brand.create({ data: { name: 'Reebok' } })
  const gucci = await prisma.brand.create({ data: { name: 'Gucci' } })

  // Aggiungi generi
  const uomo = await prisma.gender.create({ data: { name: 'Uomo' } })
  const donna = await prisma.gender.create({ data: { name: 'Donna' } })
  const bambini = await prisma.gender.create({ data: { name: 'Bambini' } })

  // Aggiungi articoli con i nuovi campi e generi
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
        photo: 'https://example.com/maglietta-nike.jpg',
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
        photo: 'https://example.com/pantaloni-sportivi-adidas.jpg',
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
        photo: 'https://example.com/scarpe-corsa-puma.jpg',
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
        photo: 'https://example.com/giacca-reebok.jpg',
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
        photo: 'https://example.com/camicia-gucci.jpg',
        codeItem: 'GC5566',
        percentualPromo: 30,
        rating: 4.9,
        description: 'Camicia elegante in cotone di alta qualità.',
      },
      {
        name: 'Felpa Sportiva Nike',
        categoryId: sport.id,
        brandId: nike.id,
        genderId: uomo.id,
        favorite: true,
        promo: false,
        plus: false,
        newArrival: true,
        price: 59.99,
        photo: 'https://example.com/felpa-sportiva-nike.jpg',
        codeItem: 'NK7890',
        percentualPromo: 0,
        rating: 4.6,
        description: 'Felpa confortevole con cappuccio, ideale per lo sport.',
      },
      {
        name: 'Polo Adidas',
        categoryId: casual.id,
        brandId: adidas.id,
        genderId: donna.id,
        favorite: false,
        promo: true,
        plus: false,
        newArrival: false,
        price: 39.99,
        photo: 'https://example.com/polo-adidas.jpg',
        codeItem: 'AD1357',
        percentualPromo: 10,
        rating: 4.1,
        description: 'Polo casual e raffinata, adatta a ogni occasione.',
      },
      {
        name: 'Giubbotto Puma',
        categoryId: outdoor.id,
        brandId: puma.id,
        genderId: uomo.id,
        favorite: true,
        promo: false,
        plus: true,
        newArrival: false,
        price: 150.0,
        photo: 'https://example.com/giubbotto-puma.jpg',
        codeItem: 'PM2468',
        percentualPromo: 0,
        rating: 4.4,
        description: 'Giubbotto caldo e resistente per le fredde giornate invernali.',
      },
      {
        name: 'Scarpe Eleganti Gucci',
        categoryId: formale.id,
        brandId: gucci.id,
        genderId: donna.id,
        favorite: true,
        promo: true,
        plus: false,
        newArrival: true,
        price: 220.0,
        photo: 'https://example.com/scarpe-eleganti-gucci.jpg',
        codeItem: 'GC9021',
        percentualPromo: 15,
        rating: 4.7,
        description: 'Scarpe eleganti per un look raffinato.',
      },
      {
        name: 'Borsa Reebok',
        categoryId: borse.id,
        brandId: reebok.id,
        genderId: bambini.id,
        favorite: false,
        promo: true,
        plus: false,
        newArrival: false,
        price: 55.0,
        photo: 'https://example.com/borsa-reebok.jpg',
        codeItem: 'RB8080',
        percentualPromo: 20,
        rating: 3.9,
        description: 'Borsa sportiva spaziosa, perfetta per la palestra.',
      }
    ]
  })

  // Hasheremo le password prima di salvarle nel database
  const hashedPassword1 = await bcrypt.hash('password123', 10) // Password di Mario Rossi
  const hashedPassword2 = await bcrypt.hash('password456', 10) // Password di Giulia Verdi

  // Aggiungi utenti con password hashate
  const user1 = await prisma.user.create({
    data: {
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario@example.com',
      password: hashedPassword1,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Giulia',
      surname: 'Verdi',
      email: 'giulia@example.com',
      password: hashedPassword2,
    },
  })

  // Aggiungi un ordine per l'utente Mario Rossi
  await prisma.order.create({
    data: {
      idUtente: user1.id,
      codeId: 'ORD123',
      price: 79.98,
    }
  })
}

main()
  .then(async () => {
    console.log('Seeder eseguito con successo');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Errore durante l\'esecuzione del seeder:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
