using Microsoft.AspNetCore.Mvc; // Add this namespace for Attributes
using Abp.Web.Security.AntiForgery;
using core.Controllers;
using Microsoft.AspNetCore.Antiforgery;

namespace core.Web.Host.Controllers
{
    // Fix: Ee controller ni call chesetappudu Token adagakudadu (kintha Attributes add chesam)
    [IgnoreAntiforgeryToken]
    public class AntiForgeryController : coreControllerBase
    {
        private readonly IAntiforgery _antiforgery;
        private readonly IAbpAntiForgeryManager _antiForgeryManager;

        public AntiForgeryController(IAntiforgery antiforgery, IAbpAntiForgeryManager antiForgeryManager)
        {
            _antiforgery = antiforgery;
            _antiForgeryManager = antiForgeryManager;
        }

        // Add [HttpGet] explicitly
        [HttpGet]
        public void GetToken()
        {
            _antiforgery.SetCookieTokenAndHeader(HttpContext);
        }

        // Add [HttpGet] explicitly
        [HttpGet]
        public void SetCookie()
        {
            _antiForgeryManager.SetCookie(HttpContext);
        }
    }
}     