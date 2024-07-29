import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPayment } from './lib/payments';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // consider to use zod to validate the input if more parameters are added
    const paymentId = event.pathParameters?.id;

    if (paymentId === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing payment ID' }),
        };
    }

    try {
        const payment = await getPayment(paymentId);

        if (!payment) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Payment not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(payment),
        };
    } catch (error) {
        // We should log the error to CloudWatch for debugging, but for now, we'll just log to the console
        console.error('Unexpected error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
