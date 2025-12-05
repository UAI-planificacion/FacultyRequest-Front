import { NextResponse }     from 'next/server';
import type { NextRequest } from 'next/server';

const BETTER_AUTH_SESSION_COOKIE_NAME = 'better-auth.session_token-faculty';

const protectedRoutes = [
    '/requests',
    '/faculty'
];

export async function middleware( request: NextRequest ): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    // Skip auth checks in development for non-API routes
    if ( process.env.NODE_ENV === 'development' && !pathname.startsWith( '/api/' )) {
        return NextResponse.next();
    }

    const isProtectedRoute = protectedRoutes
        .some( route => pathname === route || pathname.startsWith( `${route}/` ));

    if ( !isProtectedRoute ) return NextResponse.next();

    let isAuthenticated = request.cookies.has( BETTER_AUTH_SESSION_COOKIE_NAME );

    if ( !isAuthenticated ) {
        try {
            const sessionResponse = await fetch( `${request.nextUrl.origin}/api/auth/get-session`, {
                credentials : 'include', 
                headers     : {
                    'Cookie'        : request.cookies.toString(),
                    'Cache-Control' : 'no-cache'
                }
            });

            if ( sessionResponse.ok ) {
                const sessionData = await sessionResponse.json();

                if ( sessionData?.user ) {
                    return NextResponse.next();
                }
            }
        } catch ( error ) {
            isAuthenticated = false;
        }
    }

    const loginUrl = new URL( '/', request.url );
    loginUrl.searchParams.set( 'requireAuth', 'true' );
    return NextResponse.redirect( loginUrl );
}
