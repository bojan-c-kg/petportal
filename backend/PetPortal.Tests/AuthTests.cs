using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using PetPortal.Api.Dtos;

namespace PetPortal.Tests;

public class AuthTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static SignupRequest NewSignup(string email) => new()
    {
        Email = email,
        Password = "Password123!",
        FirstName = "Test",
        LastName = "User",
        Phone = "555-0100",
        Address = "1 Test Lane",
    };

    [Fact]
    public async Task Signup_creates_user_and_sets_cookie()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/signup", NewSignup($"sign-{Guid.NewGuid():N}@example.com"));

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        response.Headers.GetValues("Set-Cookie").Should().Contain(c => c.Contains("pp_auth="));
    }

    [Fact]
    public async Task Login_with_correct_creds_returns_204_and_cookie()
    {
        var email = $"login-{Guid.NewGuid():N}@example.com";
        var signupClient = _factory.CreateClient();
        await signupClient.PostAsJsonAsync("/api/auth/signup", NewSignup(email));

        var loginClient = _factory.CreateClient();
        var response = await loginClient.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequest { Email = email, Password = "Password123!" });

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        response.Headers.GetValues("Set-Cookie").Should().Contain(c => c.Contains("pp_auth="));
    }

    [Fact]
    public async Task Login_with_wrong_creds_returns_401()
    {
        var email = $"bad-{Guid.NewGuid():N}@example.com";
        var signupClient = _factory.CreateClient();
        await signupClient.PostAsJsonAsync("/api/auth/signup", NewSignup(email));

        var loginClient = _factory.CreateClient();
        var response = await loginClient.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequest { Email = email, Password = "wrong-password" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_without_cookie_returns_401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/me");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_with_cookie_returns_user()
    {
        var email = $"me-{Guid.NewGuid():N}@example.com";
        var client = _factory.CreateClient();
        var signup = await client.PostAsJsonAsync("/api/auth/signup", NewSignup(email));
        signup.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var response = await client.GetAsync("/api/me");
        response.EnsureSuccessStatusCode();
        var me = await response.Content.ReadFromJsonAsync<MeResponse>();
        me.Should().NotBeNull();
        me!.Email.Should().Be(email);
    }

    [Fact]
    public async Task Signup_with_duplicate_email_returns_409()
    {
        var email = $"dup-{Guid.NewGuid():N}@example.com";
        var firstClient = _factory.CreateClient();
        var first = await firstClient.PostAsJsonAsync("/api/auth/signup", NewSignup(email));
        first.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var secondClient = _factory.CreateClient();
        var second = await secondClient.PostAsJsonAsync("/api/auth/signup", NewSignup(email));
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}
