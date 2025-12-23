using Abp.AspNetCore.Mvc.Views;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.Mvc.Razor.Internal;

namespace core.Web.Views;

public abstract class coreRazorPage<TModel> : AbpRazorPage<TModel>
{
    [RazorInject]
    public IAbpSession AbpSession { get; set; }

    protected coreRazorPage()
    {
        LocalizationSourceName = coreConsts.LocalizationSourceName;
    }
}
