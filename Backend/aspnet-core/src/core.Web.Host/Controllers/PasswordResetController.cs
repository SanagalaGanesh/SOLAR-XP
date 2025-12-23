using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using core.Authorization.Users;
using core.Controllers;
using Microsoft.AspNetCore.Identity;
using Abp.Runtime.Caching;
using System.Linq;

namespace core.Web.Host.Controllers
{
    [Route("api/[controller]/[action]")]
    public class PasswordResetController : coreControllerBase
    {
        private readonly UserManager _userManager;
        private readonly ICacheManager _cacheManager;

        public PasswordResetController(UserManager userManager, ICacheManager cacheManager)
        {
            _userManager = userManager;
            _cacheManager = cacheManager;
        }

        // API 1: Generate Short Code
        [HttpPost]
        public async Task<SolarAuthResponse> SendResetToken([FromBody] SolarForgotPasswordInput input)
        {
            try
            {
                if (string.IsNullOrEmpty(input.Email))
                    return new SolarAuthResponse { Success = false, Message = "Email is required!" };

                var user = await _userManager.FindByEmailAsync(input.Email);

                // User lekapothe error throw cheyakunda false return chestunam (Debugger aagadu)
                if (user == null || !user.IsActive)
                    return new SolarAuthResponse { Success = false, Message = "User not found!" };

                string shortCode = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();

                await _cacheManager.GetCache("PasswordResetCodes")
                    .SetAsync(input.Email, shortCode, TimeSpan.FromMinutes(10));

                // Success Response with Code
                return new SolarAuthResponse { Success = true, Result = shortCode };
            }
            catch (Exception ex)
            {
                return new SolarAuthResponse { Success = false, Message = "Error: " + ex.Message };
            }
        }

        // API 2: Verify & Reset
        [HttpPost]
        public async Task<SolarAuthResponse> ResetPassword([FromBody] SolarResetPasswordInput input)
        {
            try
            {
                var cachedCode = await _cacheManager.GetCache("PasswordResetCodes")
                    .GetOrDefaultAsync(input.Email);

                if (cachedCode == null || cachedCode.ToString() != input.Token)
                    return new SolarAuthResponse { Success = false, Message = "Invalid or Expired Code!" };

                var user = await _userManager.FindByEmailAsync(input.Email);
                if (user == null)
                    return new SolarAuthResponse { Success = false, Message = "User not found!" };

                var realToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, realToken, input.NewPassword);

                if (result.Succeeded)
                {
                    await _cacheManager.GetCache("PasswordResetCodes").RemoveAsync(input.Email);
                    return new SolarAuthResponse { Success = true, Message = "Password Changed!" };
                }
                else
                {
                    return new SolarAuthResponse { Success = false, Message = result.Errors.FirstOrDefault()?.Description };
                }
            }
            catch (Exception ex)
            {
                return new SolarAuthResponse { Success = false, Message = "Error: " + ex.Message };
            }
        }
    }

    // RENAMED CLASS TO FIX SWAGGER ERROR
    public class SolarAuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Result { get; set; }
    }

    public class SolarForgotPasswordInput
    {
        public string Email { get; set; }
    }

    public class SolarResetPasswordInput
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}