using Abp.Events.Bus;
using Abp.Modules;
using Abp.Reflection.Extensions;
using core.Configuration;
using core.EntityFrameworkCore;
using core.Migrator.DependencyInjection;
using Castle.MicroKernel.Registration;
using Microsoft.Extensions.Configuration;

namespace core.Migrator;

[DependsOn(typeof(coreEntityFrameworkModule))]
public class coreMigratorModule : AbpModule
{
    private readonly IConfigurationRoot _appConfiguration;

    public coreMigratorModule(coreEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbSeed = true;

        _appConfiguration = AppConfigurations.Get(
            typeof(coreMigratorModule).GetAssembly().GetDirectoryPathOrNull()
        );
    }

    public override void PreInitialize()
    {
        Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
            coreConsts.ConnectionStringName
        );

        Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
        Configuration.ReplaceService(
            typeof(IEventBus),
            () => IocManager.IocContainer.Register(
                Component.For<IEventBus>().Instance(NullEventBus.Instance)
            )
        );
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(coreMigratorModule).GetAssembly());
        ServiceCollectionRegistrar.Register(IocManager);
    }
}
