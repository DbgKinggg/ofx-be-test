import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../src/listPayments';
import * as payments from '../src/lib/payments';

const mockPayments = [
    {
        id: '1',
        currency: payments.ValidCurrencies.AUD,
        amount: 2000,
    },
    {
        id: '2',
        currency: payments.ValidCurrencies.USD,
        amount: 1000,
    },
];

describe('when the user request to list all payments', () => {
    it('returns a 500 error if an unexpected error occurs', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockImplementation(() => Promise.reject(new Error('Something went wrong')));

        const result = await handler({} as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: 'Internal Server Error' });

        expect(listPaymentsMock).toHaveBeenCalled();
    });

    it('returns a 200 response with the list of payments', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

        const result = await handler({} as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ data: mockPayments });

        expect(listPaymentsMock).toHaveBeenCalledWith(undefined);
    });
});


describe('when the user request to list all payments with a specific currency', () => {
    it('returns 422 error if the currency is invalid', async () => {
        const result = await handler({
            queryStringParameters: { currency: 'INVALID' },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Validation error: Invalid currency at \"currency\"' });
    });

    it('returns 200 response with the list of payments', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

        const result = await handler({
            queryStringParameters: { currency: 'AUD' },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ data: mockPayments });

        expect(listPaymentsMock).toHaveBeenCalledWith('AUD');
    });
});