using Abp.Zero.EntityFrameworkCore;
using core.Authorization.Roles;
using core.Authorization.Users;
using core.MultiTenancy;
using core.SolarEntities;
using Microsoft.EntityFrameworkCore;

namespace core.EntityFrameworkCore;

public class coreDbContext : AbpZeroDbContext<Tenant, Role, User, coreDbContext>
{
    /* Define a DbSet for each entity of the application  */
    public DbSet<SolarProduct> SolarProducts { get; set; }
    public DbSet<QuoteHeader> QuoteHeaders { get; set; }
    public DbSet<QuoteItem> QuoteItems { get; set; }
    public DbSet<ClientOrder> ClientOrders { get; set; }

    public coreDbContext(DbContextOptions<coreDbContext> options)
        : base(options)
    {
    }
}
