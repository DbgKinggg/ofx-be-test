import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { createPayment, NewPaymentSchema, } from './lib/payments';
import { randomUUID } from 'crypto';
import { fromZodError } from 'zod-validation-error';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const parsedInput = parseInput(event.body || '{}');

        // Validate the input using Zod
        const validationResult = NewPaymentSchema.safeParse(parsedInput);

        if (!validationResult.success) {
            // We should log the error to CloudWatch for debugging, but for now, we'll just log to the console
            console.error('Validation error:', validationResult.error);
            
            /**
             * Convert Zod errors to user-friendly messages using zod-validation-error
             * We may want to log a generic error message, but this time we'll log the
             * specific validation errors as a string
             */
            const errorMessages = fromZodError(validationResult.error).message;

            return buildResponse(422, { error: errorMessages });
        }

        const newPayment = validationResult.data;
        // Generate a random UUID for the new payment
        const paymentId = randomUUID();

        await createPayment({
            ...newPayment,
            id: paymentId,
        });

        return buildResponse(201, { result: paymentId });
    } catch (error) {
        // We should log the error to CloudWatch for debugging, but for now, we'll just log to the console
        console.error('Unexpected error:', error);
        return buildResponse(500, { error: 'Internal Server Error' });
    }
};
