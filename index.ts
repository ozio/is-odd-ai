// index.ts

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Advanced type definitions
type Numeric = number | bigint | string;

interface IMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface IRequestData {
    model: string;
    messages: IMessage[];
    temperature: number;
    [key: string]: any;
}

interface IResponseData {
    choices: Array<{
        message: {
            content: string;
            [key: string]: any;
        };
        [key: string]: any;
    }>;
    [key: string]: any;
}

// Extended error handling
class OpenAIError extends Error {
    public readonly isOperational: boolean;
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.isOperational = true;
        Error.captureStackTrace(this);
    }
}

// Generics and utility types
type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

type IsOddFunction = AsyncFunction<[Numeric], boolean>;

// Intersection and Union types
type ComplexNumeric = (number & { __brand: 'ComplexNumeric' }) | bigint | string;

// Enums for response handling
enum Parity {
    Odd = 'odd',
    Even = 'even',
    Unknown = 'unknown',
}

// Type Guard
function isNumeric(value: any): value is Numeric {
    return (
      (typeof value === 'number' && !isNaN(value)) ||
      typeof value === 'bigint' ||
      (typeof value === 'string' && !isNaN(parseFloat(value as string)))
    );
}

// Main function with advanced type definitions
const isOdd: IsOddFunction = async function <T extends Numeric>(number: T): Promise<boolean> {
    // Input validation with exhaustive type checking
    if (!isNumeric(number)) {
        throw new OpenAIError('Input must be a numeric value.');
    }

    const numAsString: string = number.toString();
    const numAsNumber: number = parseFloat(numAsString);

    // Construct the request payload with detailed structure
    const requestData: IRequestData = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Is ${numAsNumber} odd or even?` }],
        temperature: 0.7,
        max_tokens: 10,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    };

    // Axios request configuration with detailed setup
    const axiosConfig: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
            'X-Custom-Header': 'IsOddFunction',
        },
        timeout: 5000,
        responseType: 'json',
        validateStatus: (status) => status >= 200 && status < 300,
    };

    try {
        // Make a POST request to OpenAI API
        const response: AxiosResponse<IResponseData> = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          requestData,
          axiosConfig
        );

        // Parse the response with structured checks
        const choices = response.data?.choices ?? [];
        const answer = choices[0]?.message?.content?.trim()?.toLowerCase() ?? '';

        // Determine parity using enums and exhaustive checks
        let parity: Parity = Parity.Unknown;
        if (answer.includes('odd')) {
            parity = Parity.Odd;
        } else if (answer.includes('even')) {
            parity = Parity.Even;
        }

        switch (parity) {
            case Parity.Odd:
                return true;
            case Parity.Even:
                return false;
            default:
                throw new OpenAIError('Unable to determine if number is odd or even.');
        }
    } catch (error: unknown) {
        // Enhanced error handling
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.message);
        } else if (error instanceof OpenAIError) {
            console.error('OpenAI error:', error.message);
        } else {
            console.error('Unexpected error:', (error as Error).message);
        }
        throw error;
    }
};

export = isOdd;
