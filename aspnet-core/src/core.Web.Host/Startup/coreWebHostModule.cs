using Abp.Modules;
using Abp.Reflection.Extensions;
using core.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace core.Web.Host.Startup
{
    [DependsOn(
       typeof(coreWebCoreModule))]
    public class coreWebHostModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public coreWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(coreWebHostModule).GetAssembly());
        }
    }
}
