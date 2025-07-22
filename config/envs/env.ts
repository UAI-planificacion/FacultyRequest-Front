import { z } from 'zod';

/**
 * Environment variables schema using Zod for validation
 */
const envSchema = z.object({
    // API URLs
    NEXT_PUBLIC_REQUEST_BACK_URL: z.string().min(1, {
        message: 'Request back URL is required',
    }),
    NEXT_PUBLIC_REQUEST_ENDPOINT: z.string(),
    NEXT_PUBLIC_ACADEMIC_SECTION: z.string().min(1),
    
    // MSAL Authentication
    NEXT_PUBLIC_MSAL_CLIENT_ID: z.string().min(1, {
        message: 'MSAL Client ID is required',
    }),
    NEXT_PUBLIC_MSAL_CLIENT_SECRET: z.string().min(1, {
        message: 'MSAL Client Secret is required',
    }),
    NEXT_PUBLIC_MSAL_TENANT_ID: z.string().min(1, {
        message: 'MSAL Tenant ID is required',
    }),
    
    // App URL
    NEXT_PUBLIC_URL: z.string().min(1, {
        message: 'App URL is required',
    }),
    
    // UAI Services
    NEXT_PUBLIC_UAI_RESERV: z.string().min(1, {
        message: 'UAI Reserv URL is required',
    }),
    NEXT_PUBLIC_UAI_KEY: z.string().min(1, {
        message: 'UAI Key is required',
    }),
    NEXT_PUBLIC_URL_WEBAPI_UAI: z.string().min(1, {
        message: 'WebAPI UAI URL is required',
    }),
    NEXT_PUBLIC_COST_CENTER: z.string().min(1),
    NEXT_PUBLIC_ACADEMIC_PERIOD: z.string().min(1),
    NEXT_PUBLIC_SUBJECTS: z.string().min(1),
    
    // Registration
    NEXT_PUBLIC_KEY_REGISTRATIONS: z.string().min(1),
    NEXT_PUBLIC_VALUE_REGISTRATIONS: z.string().min(1),
});

/**
 * Parse and validate environment variables
 */
const processEnv = {
    NEXT_PUBLIC_REQUEST_BACK_URL    : process.env.NEXT_PUBLIC_REQUEST_BACK_URL,
    NEXT_PUBLIC_REQUEST_ENDPOINT    : process.env.NEXT_PUBLIC_REQUEST_ENDPOINT,
    NEXT_PUBLIC_ACADEMIC_SECTION    : process.env.NEXT_PUBLIC_ACADEMIC_SECTION,
    NEXT_PUBLIC_MSAL_CLIENT_ID      : process.env.NEXT_PUBLIC_MSAL_CLIENT_ID,
    NEXT_PUBLIC_MSAL_CLIENT_SECRET  : process.env.NEXT_PUBLIC_MSAL_CLIENT_SECRET,
    NEXT_PUBLIC_MSAL_TENANT_ID      : process.env.NEXT_PUBLIC_MSAL_TENANT_ID,
    NEXT_PUBLIC_URL                 : process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_UAI_RESERV          : process.env.NEXT_PUBLIC_UAI_RESERV,
    NEXT_PUBLIC_UAI_KEY             : process.env.NEXT_PUBLIC_UAI_KEY,
    NEXT_PUBLIC_URL_WEBAPI_UAI      : process.env.NEXT_PUBLIC_URL_WEBAPI_UAI,
    NEXT_PUBLIC_COST_CENTER         : process.env.NEXT_PUBLIC_COST_CENTER,
    NEXT_PUBLIC_ACADEMIC_PERIOD     : process.env.NEXT_PUBLIC_ACADEMIC_PERIOD,
    NEXT_PUBLIC_SUBJECTS            : process.env.NEXT_PUBLIC_SUBJECTS,
    NEXT_PUBLIC_KEY_REGISTRATIONS   : process.env.NEXT_PUBLIC_KEY_REGISTRATIONS,
    NEXT_PUBLIC_VALUE_REGISTRATIONS : process.env.NEXT_PUBLIC_VALUE_REGISTRATIONS,
};

/**
 * Validate environment variables against schema
 */
const parsedEnv = envSchema.safeParse(processEnv);

if (!parsedEnv.success) {
    console.error(
        '❌ Invalid environment variables:',
        JSON.stringify(parsedEnv.error.format(), null, 4)
    );

    throw new Error('Invalid environment variables');
}

/**
 * Export validated environment variables
 */
export const ENV = {
    // API URLs
    REQUEST_BACK_URL: parsedEnv.data.NEXT_PUBLIC_REQUEST_BACK_URL,
    REQUEST_ENDPOINT: parsedEnv.data.NEXT_PUBLIC_REQUEST_ENDPOINT,
    ACADEMIC_SECTION: parsedEnv.data.NEXT_PUBLIC_ACADEMIC_SECTION,
    
    // MSAL
    MSAL: {
        CLIENT_ID: parsedEnv.data.NEXT_PUBLIC_MSAL_CLIENT_ID,
        CLIENT_SECRET: parsedEnv.data.NEXT_PUBLIC_MSAL_CLIENT_SECRET,
        TENANT_ID: parsedEnv.data.NEXT_PUBLIC_MSAL_TENANT_ID,
    },
    
    // App URL
    URL: parsedEnv.data.NEXT_PUBLIC_URL,
    
    // UAI Services
    UAI_RESERV: parsedEnv.data.NEXT_PUBLIC_UAI_RESERV,
    UAI_KEY: parsedEnv.data.NEXT_PUBLIC_UAI_KEY,
    URL_WEBAPI_UAI: parsedEnv.data.NEXT_PUBLIC_URL_WEBAPI_UAI,
    COST_CENTER: parsedEnv.data.NEXT_PUBLIC_COST_CENTER,
    ACADEMIC_PERIOD: parsedEnv.data.NEXT_PUBLIC_ACADEMIC_PERIOD,
    SUBJECTS: parsedEnv.data.NEXT_PUBLIC_SUBJECTS,
    
    // Registration
    KEY_REGISTRATIONS: parsedEnv.data.NEXT_PUBLIC_KEY_REGISTRATIONS,
    VALUE_REGISTRATIONS: parsedEnv.data.NEXT_PUBLIC_VALUE_REGISTRATIONS,
};