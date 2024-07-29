import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../src/createPayment';
import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';

jest.mock('crypto');

describe('When the user request to create a new payment', () => {
    it('Returns a 400 error if the input is invalid.', async () => {
        const invalidPayment = {
            currency: 'AUD',
            // amount is missing
        };

        const result = await handler({
            body: JSON.stringify(invalidPayment),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({
            error: "Validation error: Required at \"amount\""
        });
    });

    it('Returns a 500 error if an unexpected error occurs.', async () => {
        const newPayment = {
            currency: 'AUD',
            amount: 2000,
        };

        // Mock the createPayment function to throw a random error
        const createPaymentMock = jest.spyOn(payments, 'createPayment').mockImplementation(() => Promise.reject(new Error('Something went wrong')));

        const result = await handler({
            body: JSON.stringify(newPayment),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({
            error: 'Internal Server Error',
        });

        expect(createPaymentMock).toHaveBeenCalled
    });

    it('Returns the new payment id after the payment is created successfully.', async () => {
        const newPayment = {
            currency: 'AUD',
            amount: 2000,
        };

        const mockPaymentId = 'mocked-uuid';
        const mockPayment = { ...newPayment, id: mockPaymentId };

        // Mock the createPayment function
        const createPaymentMock = jest.spyOn(payments, 'createPayment').mockImplementation(() => Promise.resolve());;

        // Mock the randomUUID function so that we make sure the same id is returned
        (randomUUID as jest.Mock).mockReturnValue(mockPaymentId);

        const result = await handler({
            body: JSON.stringify(newPayment),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(201);
        expect(JSON.parse(result.body)).toEqual({
            result: mockPaymentId,
        });

        expect(createPaymentMock).toHaveBeenCalledWith(mockPayment);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
