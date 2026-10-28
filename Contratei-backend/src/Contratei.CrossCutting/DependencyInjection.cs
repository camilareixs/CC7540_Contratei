using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Contratei.CrossCutting;

public static class DependencyInjection
{
    public static IServiceCollection AddContrateiServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection não configurada.");
        //services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        return services;
    }
}
