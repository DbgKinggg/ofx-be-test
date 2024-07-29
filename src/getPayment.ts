import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPayment } from './lib/payments';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const paymentId = event.pathParameters?.id;

    if (paymentId === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing payment ID' }),
        };
    }
    
    const payment = await getPayment(paymentId);

    return {
        statusCode: 200,
        body: JSON.stringify(payment),
    };
};
