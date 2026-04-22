namespace PetPortal.Api.Auth;

public static class AuthCookie
{
    public const string Name = "pp_auth";

    public static void Set(HttpContext context, string token, bool isDevelopment)
    {
        context.Response.Cookies.Append(Name, token, BuildOptions(isDevelopment, DateTimeOffset.UtcNow.AddDays(7)));
    }

    public static void Clear(HttpContext context, bool isDevelopment)
    {
        context.Response.Cookies.Append(Name, string.Empty, BuildOptions(isDevelopment, DateTimeOffset.UtcNow.AddDays(-1)));
    }

    private static CookieOptions BuildOptions(bool isDevelopment, DateTimeOffset expires)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = !isDevelopment,
            Expires = expires,
            Path = "/",
        };
    }
}
