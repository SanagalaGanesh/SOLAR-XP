using Abp.AspNetCore.Mvc.ViewComponents;

namespace core.Web.Views;

public abstract class coreViewComponent : AbpViewComponent
{
    protected coreViewComponent()
    {
        LocalizationSourceName = coreConsts.LocalizationSourceName;
    }
}
