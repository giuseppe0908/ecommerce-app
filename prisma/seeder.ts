import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
// Aggiungi categorie
const casual = await prisma.category.create({ data: { name: 'Casual' } })
const sport = await prisma.category.create({ data: { name: 'Sport' } })
const formal = await prisma.category.create({ data: { name: 'Formal' } })
const outdoor = await prisma.category.create({ data: { name: 'Outdoor' } })
const footwear = await prisma.category.create({ data: { name: 'Footwear' } })

// Aggiungi brand
const nike = await prisma.brand.create({ data: { name: 'Nike' } })
const adidas = await prisma.brand.create({ data: { name: 'Adidas' } })
const puma = await prisma.brand.create({ data: { name: 'Puma' } })
const reebok = await prisma.brand.create({ data: { name: 'Reebok' } })
const gucci = await prisma.brand.create({ data: { name: 'Gucci' } })


  // Aggiungi articoli
  await prisma.product.createMany({
    data: [
      {
        name: 'T-Shirt Nike',
        categoryId: casual.id,
        brandId: nike.id,
        favorite: true,
        promo: false,
        price: 29.99,
        photo: 'https://example.com/tshirt-nike.jpg',
        codeItem: 'NK1234',
        percentualPromo: 10,
      },
      {
        name: 'Pantaloni Adidas',
        categoryId: sport.id,
        brandId: adidas.id,
        favorite: false,
        promo: true,
        price: 49.99,
        photo: 'https://example.com/pantaloni-adidas.jpg',
        codeItem: 'AD5678',
        percentualPromo: 20,
      },
      {
        name: 'Scarpe da Corsa Puma',
        categoryId: footwear.id,
        brandId: puma.id,
        favorite: false,
        promo: false,
        price: 89.99,
        photo: 'https://example.com/scarpe-corsa-puma.jpg',
        codeItem: 'PM1122',
        percentualPromo: 15,
      },
      {
        name: 'Giacca Reebok',
        categoryId: outdoor.id,
        brandId: reebok.id,
        favorite: true,
        promo: true,
        price: 99.99,
        photo: 'https://example.com/giacca-reebok.jpg',
        codeItem: 'RB3344',
        percentualPromo: 25,
      },
      {
        name: 'Camicia Gucci',
        categoryId: formal.id,
        brandId: gucci.id,
        favorite: false,
        promo: true,
        price: 120.0,
        photo: 'https://example.com/camicia-gucci.jpg',
        codeItem: 'GC5566',
        percentualPromo: 30,
      },
      {
        name: 'Felpa Sportiva Nike',
        categoryId: sport.id,
        brandId: nike.id,
        favorite: true,
        promo: false,
        price: 59.99,
        photo: 'https://example.com/felpa-sportiva-nike.jpg',
        codeItem: 'NK7890',
        percentualPromo: 0,
      },
      {
        name: 'Polo Adidas',
        categoryId: casual.id,
        brandId: adidas.id,
        favorite: false,
        promo: true,
        price: 39.99,
        photo: 'https://example.com/polo-adidas.jpg',
        codeItem: 'AD1357',
        percentualPromo: 10,
      },
      {
        name: 'Giubbotto Puma',
        categoryId: outdoor.id,
        brandId: puma.id,
        favorite: true,
        promo: false,
        price: 150.0,
        photo: 'https://example.com/giubbotto-puma.jpg',
        codeItem: 'PM2468',
        percentualPromo: 0,
      },
      {
        name: 'Scarpe Eleganti Gucci',
        categoryId: formal.id,
        brandId: gucci.id,
        favorite: true,
        promo: true,
        price: 220.0,
        photo: 'https://example.com/scarpe-eleganti-gucci.jpg',
        codeItem: 'GC9021',
        percentualPromo: 15,
      },
      {
        name: 'Sandali Reebok',
        categoryId: footwear.id,
        brandId: reebok.id,
        favorite: false,
        promo: true,
        price: 55.0,
        photo: 'https://example.com/sandali-reebok.jpg',
        codeItem: 'RB8080',
        percentualPromo: 20,
      }
    ]
  })
  

  // Hasheremo le password prima di salvarle nel database
  const hashedPassword1 = await bcrypt.hash('password123', 10) // Password di John Doe
  const hashedPassword2 = await bcrypt.hash('password456', 10) // Password di Jane Smith

  // Aggiungi utenti con password hashate
  const user1 = await prisma.user.create({
    data: {
      name: 'John',
      surname: "Doe",
      email: 'john@example.com',
      password: hashedPassword1, // Password hashata
      // role: 'admin',             // Ruolo 'admin'
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane',
      surname: "Smith",
      email: 'jane@example.com',
      password: hashedPassword2, // Password hashata
      // role: 'user',              // Ruolo 'user'
    },
  })

  // Aggiungi un ordine per l'utente John Doe
  await prisma.ordine.create({
    data: {
      idUtente: user1.id,
      codeId: 'ORD123',          // Codice dell'ordine
      price: 79.98,              // Prezzo totale dell'ordine
    }
  })
}

main()
  .then(async () => {
    console.log('Seeder eseguito con successo');
    await prisma.$disconnect(); // Disconnessione corretta
  })
  .catch(async (e) => {
    console.error('Errore durante l\'esecuzione del seeder:', e);
    await prisma.$disconnect();
    process.exit(1); // Termina con errore
  });
