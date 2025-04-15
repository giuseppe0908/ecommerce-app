import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { token, password } = body;

        if (!token || !password) {
            return {
                success: false,
                error: 'Token e password sono richiesti'
            };
        }

        // Find valid reset token
        const resetToken = await prisma.resetToken.findFirst({
            where: {
                token,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: true
            }
        });

        if (!resetToken) {
            return {
                success: false,
                error: 'Token non valido o scaduto'
            };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await prisma.user.update({
            where: {
                id: resetToken.userId
            },
            data: {
                password: hashedPassword
            }
        });

        // Delete used token
        await prisma.resetToken.delete({
            where: {
                id: resetToken.id
            }
        });

        return {
            success: true,
            message: 'Password aggiornata con successo'
        };

    } catch (error) {
        console.error('Errore:', error);
        return {
            success: false,
            error: 'Errore durante il reset della password'
        };
    }
});
