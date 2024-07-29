import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPayment } from './lib/payments';
import { buildResponse } from './lib/apigateway';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // consider to use zod to validate the input if more parameters are added
    const paymentId = event.pathParameters?.id;

    if (paymentId === undefined) {
        return buildResponse(400, { message: 'Missing payment ID' });
    }

    try {
        const payment = await getPayment(paymentId);

        if (!payment) {
            return buildResponse(404, { message: 'Payment not found' });
        }

       return buildResponse(200, payment);
    } catch (error) {
        // We should log the error to CloudWatch for debugging, but for now, we'll just log to the console
        console.error('Unexpected error:', error);
        return buildResponse(500, { message: 'Internal Server Error' });
    }
};
