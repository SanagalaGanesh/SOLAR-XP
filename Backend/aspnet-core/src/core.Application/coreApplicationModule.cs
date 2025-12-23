using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using core.Authorization;

namespace core;

[DependsOn(
    typeof(coreCoreModule),
    typeof(AbpAutoMapperModule))]
public class coreApplicationModule : AbpModule
{
    public override void PreInitialize()
    {
        Configuration.Authorization.Providers.Add<coreAuthorizationProvider>();
    }

    public override void Initialize()
    {
        var thisAssembly = typeof(coreApplicationModule).GetAssembly();

        IocManager.RegisterAssemblyByConvention(thisAssembly);

        Configuration.Modules.AbpAutoMapper().Configurators.Add(
            // Scan the assembly for classes which inherit from AutoMapper.Profile
            cfg => cfg.AddMaps(thisAssembly)
        );
    }
}
