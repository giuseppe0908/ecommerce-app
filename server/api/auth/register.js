import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  
  const body = await readBody(event);
  const { name, surname, email, password, role , address, number } = body;
console.log(body);

  console.log(email);

  // Verifica che l'email non esista già
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Email già registrata' });
  }

  // Crittografa la password
  const hashedPassword = await bcrypt.hash(password, 10);
 
  // Imposta il ruolo
  const userRole = role ? 'ADMIN' : 'USER'; // Verifica se il checkbox è selezionato
    
  const user = await prisma.user.create({
    data: {
      name,
      surname,
      email,
      password: hashedPassword,
      role: userRole,
      address,
      number,
    },
  });

  return { message: 'Registrazione completata', user: { name: user.name, role: user.role, address: user.address, number: user.number } };
});
