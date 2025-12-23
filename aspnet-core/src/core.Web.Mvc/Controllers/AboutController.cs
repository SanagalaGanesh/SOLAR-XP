using Abp.AspNetCore.Mvc.Authorization;
using core.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace core.Web.Controllers;

[AbpMvcAuthorize]
public class AboutController : coreControllerBase
{
    public ActionResult Index()
    {
        return View();
    }
}
