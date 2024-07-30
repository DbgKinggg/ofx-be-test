import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments, ValidCurrencies } from './lib/payments';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const PaymentListSchema = z.object({
    currency: z.nativeEnum(ValidCurrencies, { message: 'Invalid currency' }).optional(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const parsedInput = event.queryStringParameters || {};
        const validationResult = PaymentListSchema.safeParse(parsedInput);

        if (!validationResult.success) {
            // We should log the error to CloudWatch for debugging, but for now, we'll just log to the console
            console.error('Validation error:', validationResult.error);
                
            // convert to a user-friendly message
            const errorMessages = fromZodError(validationResult.error).message;

            return buildResponse(422, { error: errorMessages });
        }

        const payments = await listPayments(
            validationResult.data.currency as string | undefined
        );
        return buildResponse(200, { data: payments });
    } catch (error) {
        // We should log the error to CloudWatch for debugging, but for now, we'll just log to the console
        console.error('Unexpected error:', error);
        return buildResponse(500, { error: 'Internal Server Error' });
    }
};