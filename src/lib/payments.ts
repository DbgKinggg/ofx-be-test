import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: 'Payments',
            Key: { paymentId },
        })
    );

    return (result.Item as Payment) || null;
};

export const listPayments = async (): Promise<Payment[]> => {
    const result = await DocumentClient.send(
        new ScanCommand({
            TableName: 'Payments',
        })
    );

    return (result.Items as Payment[]) || [];
};

export const createPayment = async (payment: Payment) => {
    await DocumentClient.send(
        new PutCommand({
            TableName: 'Payments',
            Item: payment,
        })
    );
};


// we may want to move these schemas/types to a separate file in the future
export const NewPaymentSchema = z.object({
    amount: z.number(),
    currency: z.string(),
});

export const PaymentSchema = NewPaymentSchema.extend({
    id: z.string(),
});

export type Payment = z.infer<typeof PaymentSchema>;