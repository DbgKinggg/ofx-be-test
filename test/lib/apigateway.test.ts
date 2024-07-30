import { buildResponse, parseInput } from '../../src/lib/apigateway';
import { APIGatewayProxyResult } from 'aws-lambda';

describe('APIGateway Utility Functions', () => {
    describe('buildResponse', () => {
        it('should return a valid APIGatewayProxyResult', () => {
            const statusCode = 200;
            const body = { message: 'Success' };
            const result: APIGatewayProxyResult = buildResponse(statusCode, body);

            expect(result).toEqual({
                statusCode,
                body: JSON.stringify(body),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
            });
        });
    });

    describe('parseInput', () => {
        it('should parse a valid JSON string', () => {
            const jsonString = '{"key": "value"}';
            const result = parseInput(jsonString);

            expect(result).toEqual({ key: 'value' });
        });

        it('should return an empty object for an invalid JSON string and log an error', () => {
            const invalidJsonString = '{"key": "value"';
            console.error = jest.fn(); // Mock console.error

            const result = parseInput(invalidJsonString);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalled();
        });
    });
});