import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

interface TransferData {
  amount: number;
  recipientEmail: string;
  description?: string;
}

interface TransferResponse {
  success: boolean;
  newBalance: number;
  message?: string;
}

export const transfer = onCall<TransferData, Promise<TransferResponse>>(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Vous devez être connecté.');
    }

    const senderUid = request.auth.uid;
    const { amount, recipientEmail, description = '' } = request.data;

    if (typeof amount !== 'number' || amount <= 0) {
      throw new HttpsError('invalid-argument', 'Montant invalide.');
    }

    const senderRef = db.collection('users').doc(senderUid);
    const senderSnap = await senderRef.get();
    if (!senderSnap.exists) {
      throw new HttpsError('not-found', 'Expéditeur introuvable.');
    }
    const sender = senderSnap.data()!;
    const senderBalance = sender.balance ?? 0;

    if (senderBalance < amount) {
      throw new HttpsError('failed-precondition', 'Solde insuffisant.');
    }

    const recipientQuery = await db.collection('users')
      .where('email', '==', recipientEmail.toLowerCase())
      .limit(1)
      .get();
    if (recipientQuery.empty) {
      throw new HttpsError('not-found', 'Destinataire introuvable.');
    }
    const recipientDoc = recipientQuery.docs[0];
    const recipient = recipientDoc.data();
    const recipientUid = recipientDoc.id;

    if (recipientUid === senderUid) {
      throw new HttpsError('invalid-argument', 'Virement à soi-même interdit.');
    }

    const newSenderBalance = senderBalance - amount;
    const newRecipientBalance = (recipient.balance ?? 0) + amount;
    const now = Date.now();

    const batch = db.batch();

    batch.update(senderRef, { balance: newSenderBalance });
    batch.update(recipientDoc.ref, { balance: newRecipientBalance });

    const senderTxRef = senderRef.collection('transactions').doc();
    batch.set(senderTxRef, {
      type: 'transfer_out',
      amount,
      description: description || `Virement à ${recipientEmail}`,
      timestamp: now,
      balanceAfter: newSenderBalance,
      counterpartEmail: recipientEmail,
    });

    const recipientTxRef = recipientDoc.ref.collection('transactions').doc();
    batch.set(recipientTxRef, {
      type: 'transfer_in',
      amount,
      description: description || `Virement de ${sender.email}`,
      timestamp: now,
      balanceAfter: newRecipientBalance,
      counterpartEmail: sender.email,
    });

    await batch.commit();

    // Optionnel : emails (ignore les erreurs)
    try {
      // Tu peux appeler ta fonction d'envoi d'email ici
      console.log(`Email à ${sender.email} et ${recipient.email}`);
    } catch(e) {}

    return {
      success: true,
      newBalance: newSenderBalance,
      message: `Virement de ${amount}€ à ${recipientEmail} effectué.`,
    };
  }
);