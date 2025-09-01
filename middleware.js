// middleware.js
export const config = {
  matcher: [
    // exclude api, _next, file statis
    "/((?!api|_next|static|favicon.ico).*)",
  ],
};
