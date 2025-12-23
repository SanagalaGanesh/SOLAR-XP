using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace core.Controllers
{
    public abstract class coreControllerBase : AbpController
    {
        protected coreControllerBase()
        {
            LocalizationSourceName = coreConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
