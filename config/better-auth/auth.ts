import { betterAuth } from "better-auth"
import { ENV } from "../envs/env"


export const auth = betterAuth({
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    cookies: {
        sessionToken: {
            name    : "better-auth.session_token-faculty",
            options : {
                httpOnly    : true,
                sameSite    : "lax",
                path        : "/",
                secure      : false,
                maxAge      : 60 * 60 * 24 * 7,
                // domain      : undefined
            }
        }
    },
    socialProviders: {
        microsoft: { 
            clientId                : ENV.MSAL.CLIENT_ID, 
            clientSecret            : ENV.MSAL.CLIENT_SECRET, 
            tenantId                : ENV.MSAL.TENANT_ID, 
            redirectURI				: ENV.URL + '/api/auth/callback/microsoft',
			requireSelectAccount    : true,
            scope                   : [ "openid", "profile", "email", "offline_access", "https://graph.microsoft.com/User.Read" ],
        }, 
    },
});
