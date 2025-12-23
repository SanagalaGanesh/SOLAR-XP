using Abp.AspNetCore;
using Abp.AspNetCore.TestBase;
using Abp.Modules;
using Abp.Reflection.Extensions;
using core.EntityFrameworkCore;
using core.Web.Startup;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace core.Web.Tests;

[DependsOn(
    typeof(coreWebMvcModule),
    typeof(AbpAspNetCoreTestBaseModule)
)]
public class coreWebTestModule : AbpModule
{
    public coreWebTestModule(coreEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
    }

    public override void PreInitialize()
    {
        Configuration.UnitOfWork.IsTransactional = false; //EF Core InMemory DB does not support transactions.
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(coreWebTestModule).GetAssembly());
    }

    public override void PostInitialize()
    {
        IocManager.Resolve<ApplicationPartManager>()
            .AddApplicationPartsIfNotAddedBefore(typeof(coreWebMvcModule).Assembly);
    }
}