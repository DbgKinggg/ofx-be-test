import { DocumentClient } from '../../src/lib/dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getPayment, listPayments, createPayment, ValidCurrencies } from '../../src/lib/payments';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// Mock the dependencies
jest.mock('../../src/lib/dynamodb', () => ({
    DocumentClient: {
        send: jest.fn(),
    },
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    GetCommand: jest.fn(),
    ScanCommand: jest.fn(),
    PutCommand: jest.fn(),
}));

jest.mock('@aws-sdk/util-dynamodb', () => ({
    marshall: jest.fn().mockImplementation((data) => data),
    unmarshall: jest.fn().mockImplementation((data) => data),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getPayment', () => {
    it('should return null when the payment item is not found', async () => {
        const paymentId = '111';
        (DocumentClient.send as jest.Mock).mockResolvedValue({ Item: undefined });

        const result = await getPayment(paymentId);

        // make sure that the right table name and key are used
        expect(GetCommand).toHaveBeenCalledWith({
            TableName: 'Payments',
            Key: { paymentId },
        });

        expect(DocumentClient.send).toHaveBeenCalledWith(
            expect.any(GetCommand)
        );
        expect(result).toBeNull();
    });
    
    it('should return the payment item when found', async () => {
        const paymentId = '222';
        const payment = { paymentId, amount: 100 };
        (DocumentClient.send as jest.Mock).mockResolvedValue({ Item: payment });

        const result = await getPayment(paymentId);

        // make sure that the right table name and key are used
        expect(GetCommand).toHaveBeenCalledWith({
            TableName: 'Payments',
            Key: { paymentId },
        });

        expect(DocumentClient.send).toHaveBeenCalledWith(
            expect.any(GetCommand)
        );
        expect(result).toEqual(payment);
    });
});

describe('listPayments', () => {
    it('should return a list of payments when no currency filter is applied', async () => {
        const payments = [{ paymentId: '123', amount: 100 }];
        (DocumentClient.send as jest.Mock).mockResolvedValue({ Items: payments.map(payment => marshall(payment)) });

        const result = await listPayments();

        // make srue that the right table name is used
        expect(ScanCommand).toHaveBeenCalledWith({
            TableName: 'Payments',
        });
        expect(DocumentClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
        expect(result).toEqual(payments);
    });

    it('should return a filtered list of payments when a currency filter is applied', async () => {
        const currency = 'USD';
        const payments = [{ paymentId: '123', amount: 100, currency }];
        (DocumentClient.send as jest.Mock).mockResolvedValue({ Items: payments.map(payment => marshall(payment)) });

        const result = await listPayments(currency);

        // make sure that the right table name and filter expression are used
        expect(ScanCommand).toHaveBeenCalledWith({
            TableName: 'Payments',
            FilterExpression: 'currency = :currency',
            ExpressionAttributeValues: { ':currency': currency },
        });
        expect(DocumentClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
        expect(result).toEqual(payments);
    });

    it('should return an empty list if no items are found', async () => {
        (DocumentClient.send as jest.Mock).mockResolvedValue({ Items: [] });

        const result = await listPayments();

        expect(ScanCommand).toHaveBeenCalledWith({
            TableName: 'Payments',
        });
        expect(DocumentClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
        expect(result).toEqual([]);
    });

    it('should handle the case where Items is undefined', async () => {
        (DocumentClient.send as jest.Mock).mockResolvedValue({});

        const result = await listPayments();

        expect(ScanCommand).toHaveBeenCalledWith({
            TableName: 'Payments',
        });
        expect(DocumentClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
        expect(result).toEqual([]);
    });
});

describe('createPayment', () => {
    // mocked payment object
    const payment = {
        paymentId: '111',
        amount: 99,
        currency: ValidCurrencies.USD
    };

    it('should call DocumentClient.send with the correct parameters', async () => {
        await createPayment(payment);

        expect(PutCommand).toHaveBeenCalledWith({
            TableName: 'Payments',
            Item: payment,
        });
        expect(DocumentClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
    });

    it('should handle errors thrown by DocumentClient.send', async () => {
        const error = new Error('Failed to create payment due to some reason');
        (DocumentClient.send as jest.Mock).mockRejectedValue(error);

        await expect(createPayment(payment)).rejects.toThrow('Failed to create payment due to some reason');
    });
});