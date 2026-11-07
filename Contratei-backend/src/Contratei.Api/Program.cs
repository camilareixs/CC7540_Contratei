using Contratei.Api.Models;
using Contratei.Data.Repositories;
using Contratei.Domain.Entities;
using Contratei.Service.Interfaces;
using Contratei.Service.Services;
using Supabase.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSupabase(
    builder.Configuration["Supabase:Url"]!,
    builder.Configuration["Supabase:Key"]!
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();

builder.Services.AddScoped<NpgsqlDataSource>(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("SupabaseDatabase");

    return NpgsqlDataSource.Create(connectionString!);
});

builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.AddScoped<IProviderRepository, ProviderRepository>();

builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IProviderServiceRepository, ProviderServiceRepository>();

builder.Services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
//builder.Services.AddScoped<IProviderServiceCatalog, ProviderServiceCatalog>();

// Serviço responsável pelo cadastro e consulta de profissionais
builder.Services.AddScoped<
    Contratei.Service.Interfaces.IProviderService,
    Contratei.Service.Services.ProviderService>();

// Serviço responsável por associar serviços aos profissionais
builder.Services.AddScoped<
    Contratei.Service.Interfaces.IProviderServiceCatalog,
    Contratei.Service.Services.ProviderServiceCatalog>();

builder.Services.AddScoped<
    IAvailabilityRepository,
    AvailabilityRepository>();

builder.Services.AddScoped<
    IAvailabilityService,
    AvailabilityService>();

builder.Services.AddScoped<
    IAppointmentRepository,
    AppointmentRepository>();

builder.Services.AddScoped<
    IAppointmentService,
    AppointmentService>();

builder.Services.AddScoped<
    Contratei.Data.Repositories.IProviderAppointmentRepository,
    Contratei.Data.Repositories.ProviderAppointmentRepository>();

builder.Services.AddScoped<
    Contratei.Service.Interfaces.IProviderAppointmentService,
    Contratei.Service.Services.ProviderAppointmentService>();

builder.Services.AddScoped<
    IProviderProfileRepository,
    ProviderProfileRepository>();

builder.Services.AddScoped<
    IProviderProfileService,
    ProviderProfileService>();



builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.MapControllers();
app.UseCors("Frontend");

var supabase = app.Services.GetRequiredService<Supabase.Client>();
await supabase.InitializeAsync();

app.MapGet("/todos", async (Supabase.Client client) =>
{
    var response = await client.From<Todo>().Get();
    return Results.Ok(response.Models);
});

app.MapGet("/test-db", async (NpgsqlDataSource dataSource) =>
{
    await using var connection = await dataSource.OpenConnectionAsync();

    await using var command = new NpgsqlCommand("SELECT 1", connection);
    var result = await command.ExecuteScalarAsync();

    return Results.Ok(new
    {
        connected = true,
        result
    });
});

app.Run();
