import { DynamoDB } from '../../src/lib/dynamodb';

// Mock the AWS SDK clients, so that it won't make actual API calls
jest.mock('@aws-sdk/client-dynamodb', () => {
    return {
        DynamoDBClient: jest.fn(),
    };
});

jest.mock('@aws-sdk/lib-dynamodb', () => {
    return {
        DynamoDBDocumentClient: {
            from: jest.fn(),
        },
    };
});

describe('DynamoDB Configuration', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        // reset the environment variables
        delete process.env.NODE_ENV;
        delete process.env.AWS_REGION;
        delete process.env.AWS_ACCESS_KEY;
        delete process.env.AWS_SECRET_KEY;
    });

    it('should configure DynamoDBClient with default params if NODE_ENV is undefined', () => {
        process.env.NODE_ENV = undefined;
        process.env.AWS_REGION = 'ap-southeast-1';

        // Clear the require cache to ensure the environment variables are picked up
        jest.isolateModules(() => {
            const { DynamoDB: _dynamoDB } = require('../../src/lib/dynamodb');
            const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

            expect(DynamoDBClient).toHaveBeenCalledWith({
                region: 'ap-southeast-1',
            });
        });
    });

    it('should configure DynamoDBClient with default params in non-test environment', () => {
        process.env.NODE_ENV = 'development';
        process.env.AWS_REGION = 'ap-southeast-1';

        // Clear the require cache to ensure the environment variables are picked up
        jest.isolateModules(() => {
            const { DynamoDB: _dynamoDB } = require('../../src/lib/dynamodb');
            const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

            expect(DynamoDBClient).toHaveBeenCalledWith({
                region: 'ap-southeast-1',
            });
        });
    });

    it('should configure DynamoDBClient with test config in test environment', () => {
        process.env.NODE_ENV = 'test';
        process.env.AWS_REGION = 'ap-southeast-1';
        process.env.AWS_ACCESS_KEY = 'test_key';
        process.env.AWS_SECRET_KEY = 'test_secret_key';

        // Clear the require cache to ensure the environment variables are picked up
        jest.isolateModules(() => {
            const { DynamoDB: _dynamoDB } = require('../../src/lib/dynamodb');
            const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

            expect(DynamoDBClient).toHaveBeenCalledWith({
                region: 'ap-southeast-1',
                credentials: {
                    accessKeyId: 'test_key',
                    secretAccessKey: 'test_secret_key',
                },
                endpoint: 'http://localhost:8000',
                sslEnabled: false,
            });
        });
    });

    it('should create DocumentClient from DynamoDBClient', () => {
        jest.isolateModules(() => {
            const { DynamoDB: _dynamoDB } = require('../../src/lib/dynamodb');
            const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

            expect(DynamoDBDocumentClient.from).toHaveBeenCalledWith(DynamoDB);
        });
    });
});