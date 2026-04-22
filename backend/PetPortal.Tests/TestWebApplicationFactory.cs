using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PetPortal.Api.Data;

namespace PetPortal.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = "Host=dummy;Database=dummy;Username=dummy;Password=dummy",
                ["Jwt:Secret"] = "test-secret-sufficiently-long-to-satisfy-hmac-sha256-length-requirements!",
                ["Jwt:Issuer"] = "PetPortal",
                ["Jwt:Audience"] = "PetPortal",
            });
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<PetPortalDbContext>));
            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<PetPortalDbContext>(opts => opts.UseInMemoryDatabase(_dbName));
        });
    }
}
