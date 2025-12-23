using Abp.EntityFrameworkCore.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Zero.EntityFrameworkCore;
using core.EntityFrameworkCore.Seed;

namespace core.EntityFrameworkCore;

[DependsOn(
    typeof(coreCoreModule),
    typeof(AbpZeroCoreEntityFrameworkCoreModule))]
public class coreEntityFrameworkModule : AbpModule
{
    /* Used it tests to skip dbcontext registration, in order to use in-memory database of EF Core */
    public bool SkipDbContextRegistration { get; set; }

    public bool SkipDbSeed { get; set; }

    public override void PreInitialize()
    {
        if (!SkipDbContextRegistration)
        {
            Configuration.Modules.AbpEfCore().AddDbContext<coreDbContext>(options =>
            {
                if (options.ExistingConnection != null)
                {
                    coreDbContextConfigurer.Configure(options.DbContextOptions, options.ExistingConnection);
                }
                else
                {
                    coreDbContextConfigurer.Configure(options.DbContextOptions, options.ConnectionString);
                }
            });
        }
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(coreEntityFrameworkModule).GetAssembly());
    }

    public override void PostInitialize()
    {
        if (!SkipDbSeed)
        {
            SeedHelper.SeedHostDb(IocManager);
        }
    }
}
