import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { name, surname, email, products, totalPrice, address, phone } = await readBody(event);
  // Controlla se l'utente esiste
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

    // Crea i dati dell'ordine  
  const createOrderData = (userId) => ({
    data: {
      idUtente: userId,
      price: totalPrice,
      products: {
        create: products.map(({ id, quantity }) => ({
          product: { connect: { id } },
          quantity,
        })),
      },
    },
    include: { products: true },
  });

  if (existingUser) {
    // Crea l'ordine per l'utente esistente
    const order = await prisma.order.create(createOrderData(existingUser.id));
    await sendOrderConfirmationEmail(email, name, order, products);
    return { message: 'Ordine creato con successo', order };
  } else {
    // Genera una password casuale
    const generatePassword = (length) => {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let password = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      return password;
    };

    const password = generatePassword(10);
    console.log(password); // Output: una password casuale di 10 caratteri

    // Crittografa la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Imposta il ruolo
    const userRole = 'USER';

    // Crea il nuovo utente
    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        password: hashedPassword,
        role: userRole,
        address,
        number: phone
      },
    });

    // Crea l'ordine per il nuovo utente
    const order = await prisma.order.create(createOrderData(user.id));

    await sendOrderConfirmationEmail(email, name, order, products, password);

    return { message: 'Registrazione completata e ordine creato', user: { name: user.name, role: user.role }, order };
  }
});

const sendOrderConfirmationEmail = async (email, name, order, products, password = null) => {
  // Configura nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Puoi usare il servizio email che preferisci
    auth: {
      user: process.env.EMAIL_USER, // Usa la tua email dal file .env
      pass: process.env.EMAIL_PASS, // Usa la tua password dal file .env
    },
  });

  const productIds = products.map(product => product.id);

  // Prendiamo le informazioni sui prodotti tramite il loro id
  const product_Single = await prisma.product.findMany({
    where: {
        id:{
            in: productIds
        }     
    },
    include: {
      category: true,
      brand: true,
    },
  }); 
   
    
  // Crea il contenuto dell'email  
  const styleImg = 'width: 100px; height: 100px; border-radius: 25%;';
  const productDetails = product_Single.map((p, index) => {
    const quantity = products[index].quantity;
    return `<li style="display:flex;justify-content: space-between; align-items:center">
              <img style="${styleImg}" src="${p.photo}" alt="${p.name}" />
              <p><b>${p.name} x ${quantity}</b></p>
              <p>€${p.price}</p>
            </li>`;
  }).join('\n');  const passwordMessage = password ? `\n\nLa tua password è: ${password}` : '';
  const mailOptions = {
    from: process.env.EMAIL_USER, // Usa la tua email dal file .env
    to: email,
    subject: 'Conferma Ordine',
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p style="color:red">Ciao ${name},</p>
      <p>Grazie per il tuo ordine. Ecco i dettagli del tuo ordine:</p>
      <ul>${productDetails}</ul>
      <p>Totale: <strong>${order.price}€</strong></p>
      ${passwordMessage}
      <p>Cordiali saluti,<br>Il team</p>
    </div>
  `,  };

  // Invia l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Errore durante l\'invio dell\'email:', error);
    } else {
      console.log('Email inviata:', info.response);
    }
  });
};