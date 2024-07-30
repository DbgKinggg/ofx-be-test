import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/getPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user requests the records for a specific payment', () => {
    it('Returns a 400 error if the input is invalid.', async () => {
        const result = await handler({
            // pass in an empty object to simulate an invalid input
            body: JSON.stringify({}),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({ message: 'Missing payment ID' });
    });

    it('Returns a 404 error if the payment is not found.', async () => {
        const paymentId = randomUUID();
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(null);

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(404);
        expect(JSON.parse(result.body)).toEqual({ message: 'Payment not found' });

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns a 500 error if an unexpected error occurs.', async () => {
        const paymentId = randomUUID();
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockRejectedValueOnce(new Error('Something went wrong'));

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ message: 'Internal Server Error' });

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns the payment matching their input parameter.', async () => {
        const paymentId = randomUUID();
        const mockPayment = {
            id: paymentId,
            currency: payments.ValidCurrencies.AUD,
            amount: 2000,
        };
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(mockPayment);

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockPayment);

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
