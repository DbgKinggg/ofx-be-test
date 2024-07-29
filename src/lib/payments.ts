import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: 'Payments',
            Key: { paymentId },
        })
    );

    return (result.Item as Payment) || null;
};

export const listPayments = async (currency?: string) => {
    const params: any = {
        TableName: 'Payments',
    };

    if (currency) {
        params.FilterExpression = 'currency = :currency';
        params.ExpressionAttributeValues = marshall({
            ':currency': currency,
        });
    }

    const command = new ScanCommand(params);
    const response = await DocumentClient.send(command);

    return response.Items ? response.Items.map(item => unmarshall(item)) : [];
};

export const createPayment = async (payment: Payment) => {
    await DocumentClient.send(
        new PutCommand({
            TableName: 'Payments',
            Item: payment,
        })
    );
};

export enum ValidCurrencies {
    USD = 'USD',
    AUD = 'AUD',
    // Add more valid currency as needed
    // or we should validate against a list of valid currencies in the db instead
}

// we may want to move these schemas/types to a separate file in the future
export const NewPaymentSchema = z.object({
    amount: z.number()
        .positive('Amount must be a positive number')
        // change this based on the business requirement
        .max(1000000, 'Amount must be less than or equal to 1,000,000'),
    currency: z.nativeEnum(ValidCurrencies,  { message: 'Invalid currency' }),
});

export const PaymentSchema = NewPaymentSchema.extend({
    id: z.string(),
});

export type Payment = z.infer<typeof PaymentSchema>;