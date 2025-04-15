import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try{
        const body = await readBody(event);
        const email = body.email;
        const user = await prisma.user.findUnique({
            where: {email}
        });
        
        if(!user){
            return {
                success: false,
                error: 'Utente non trovato'
            };
        }

         // Genera il token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }  // Scadenza di 1 ora
        );        
    
        // Trova se esiste già un token per questo utente
        const existingToken = await prisma.resetToken.findFirst({
            where: { userId: user.id },
        });
    
        if (existingToken) {
            // Se esiste, aggiorna il record del token
            await prisma.resetToken.update({
                where: { id: existingToken.id },  // Usa l'id del token esistente per l'aggiornamento
                data: {
                    token,  // Aggiorna il token
                    expiresAt: new Date(Date.now() + 3600 * 1000),  // Scadenza tra 1 ora
                },
            });
        } else {
            // Se non esiste, crea un nuovo record per il token
            await prisma.resetToken.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt: new Date(Date.now() + 3600 * 1000), // Scadenza tra 1 ora
                },
            });
        }

        const resetLink = `localhost:3000/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail', // Puoi usare il servizio email che preferisci
            auth: {
              user: process.env.EMAIL_USER, // Usa la tua email dal file .env
              pass: process.env.EMAIL_PASS, // Usa la tua password dal file .env
            },
          });

        // Invia l'email con il link di reset
        const mailOptions = {
            from: process.env.EMAIL_USER, // Usa la tua email dal file .env
            to: email,
            subject: 'Reset Password',
            html: `
            <p>Clicca sul link seguente per resettare la tua password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Il link scadrà tra 1 ora.</p>`,  
        };
        
          // Invia l'email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Errore durante l\'invio dell\'email:', error);
            } else {
              console.log('Email inviata:', info.response);
            }
          });

        return { message: 'Email inviata con successo' };     

    } catch (error) {
        console.error('Errore:', error);
        return {
        success: false,
        error: 'Errore durante il processo di reset password'
        };
    }  
});
