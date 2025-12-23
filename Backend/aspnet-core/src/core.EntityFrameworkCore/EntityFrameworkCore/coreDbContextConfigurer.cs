using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace core.EntityFrameworkCore;

public static class coreDbContextConfigurer
{
    public static void Configure(DbContextOptionsBuilder<coreDbContext> builder, string connectionString)
    {
        builder.UseSqlServer(connectionString);
    }

    public static void Configure(DbContextOptionsBuilder<coreDbContext> builder, DbConnection connection)
    {
        builder.UseSqlServer(connection);
    }
}
