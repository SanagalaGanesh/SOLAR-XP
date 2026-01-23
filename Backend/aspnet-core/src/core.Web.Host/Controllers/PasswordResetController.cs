using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Abp.BackgroundJobs;
using Abp.Runtime.Caching;
using core.Authorization.Users;
using core.Controllers;
using core.Jobs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Text.RegularExpressions;

namespace core.Web.Host.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class PasswordResetController : coreControllerBase
    {
        private const string PasswordResetCacheName = "PasswordResetCodes";
        private const string PasswordResetAttemptsCacheName = "PasswordResetAttempts";
        private const int CodeExpiryMinutes = 10;
        private const int MaxVerificationAttempts = 5;

        private readonly UserManager _userManager;
        private readonly ICacheManager _cacheManager;
        private readonly IBackgroundJobManager _backgroundJobManager;
        private readonly ILogger<PasswordResetController> _logger;

        public PasswordResetController(
            UserManager userManager,
            ICacheManager cacheManager,
            IBackgroundJobManager backgroundJobManager,
            ILogger<PasswordResetController> logger)
        {
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _cacheManager = cacheManager ?? throw new ArgumentNullException(nameof(cacheManager));
            _backgroundJobManager = backgroundJobManager ?? throw new ArgumentNullException(nameof(backgroundJobManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // API 1: Send Short Code via Email
        [HttpPost]
        public async Task<ActionResult<SolarAuthResponse>> SendResetToken([FromBody] SolarForgotPasswordInput input, CancellationToken cancellationToken = default)
        {
            if (input == null || string.IsNullOrWhiteSpace(input.Email))
                return BadRequest(new SolarAuthResponse { Success = false, Message = "Email is required!" });

            // Generic success response to avoid user enumeration
            var genericSuccess = new SolarAuthResponse
            {
                Success = true,
                Result = "a code has been sent to the email provided.",
                Message = "Check your Email."
            };

            try
            {
                var user = await _userManager.FindByEmailAsync(input.Email);
                if (user == null || !user.IsActive)
                {
                    _logger.LogInformation("Password reset requested for non-existing or inactive account: {Email}", input.Email);
                    return Ok(genericSuccess);
                }

                // Generate a cryptographically secure 6-digit code
                string shortCode = GenerateSixDigitCode();

                // Hash code before storing in cache to avoid storing plaintext
                string hashedCode = HashString(shortCode);

                // Store hashed code and reset attempts counter
                await _cacheManager.GetCache(PasswordResetCacheName)
                    .SetAsync(input.Email, hashedCode, TimeSpan.FromMinutes(CodeExpiryMinutes));
                await _cacheManager.GetCache(PasswordResetAttemptsCacheName)
                    .SetAsync(input.Email, 0, TimeSpan.FromMinutes(CodeExpiryMinutes));

                // Enqueue email job with plaintext code (only for sending)
                await _backgroundJobManager.EnqueueAsync<PasswordResetEmailJob, PasswordResetArgs>(
                    new PasswordResetArgs { TargetEmail = input.Email, Code = shortCode }
                );

                return Ok(genericSuccess);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending reset token for {Email}", input.Email);
                return StatusCode(500, new SolarAuthResponse { Success = false, Message = "An unexpected error occurred." });
            }
        }

        // API 2: Verify & Reset
        [HttpPost]
        public async Task<ActionResult<SolarAuthResponse>> ResetPassword([FromBody] SolarResetPasswordInput input, CancellationToken cancellationToken = default)
        {
            if (input == null || string.IsNullOrWhiteSpace(input.Email) || string.IsNullOrWhiteSpace(input.Token) || string.IsNullOrWhiteSpace(input.NewPassword))
                return BadRequest(new SolarAuthResponse { Success = false, Message = "Email, Token and NewPassword are required!" });

            try
            {
                var attemptsCache = _cacheManager.GetCache(PasswordResetAttemptsCacheName);
                var resetCache = _cacheManager.GetCache(PasswordResetCacheName);

                var attemptsObj = await attemptsCache.GetOrDefaultAsync(input.Email);
                var attempts = attemptsObj == null ? 0 : Convert.ToInt32(attemptsObj);

                if (attempts >= MaxVerificationAttempts)
                    return BadRequest(new SolarAuthResponse { Success = false, Message = "Too many incorrect attempts. Please request a new code." });

                var cachedHashedObj = await resetCache.GetOrDefaultAsync(input.Email);
                if (cachedHashedObj == null)
                    return BadRequest(new SolarAuthResponse { Success = false, Message = "Invalid or Expired Code!" });

                var cachedHashed = cachedHashedObj.ToString();
                var providedHashed = HashString(input.Token);

                if (!ConstantTimeEquals(cachedHashed, providedHashed))
                {
                    attempts++;
                    await attemptsCache.SetAsync(input.Email, attempts, TimeSpan.FromMinutes(CodeExpiryMinutes));
                    _logger.LogWarning("Invalid password reset code attempt {Attempt} for {Email}", attempts, input.Email);
                    return BadRequest(new SolarAuthResponse { Success = false, Message = "Invalid or Expired Code!" });
                }

                var user = await _userManager.FindByEmailAsync(input.Email);
                if (user == null)
                    return BadRequest(new SolarAuthResponse { Success = false, Message = "User not found!" });

                // Prevent re-using the current password
                var isSameAsCurrent = await _userManager.CheckPasswordAsync(user, input.NewPassword);
                if (isSameAsCurrent)
                    return BadRequest(new SolarAuthResponse { Success = false, Message = "New password must be different from the current password." });

                // Custom password policy checks with clear messages for frontend
                var passwordValidationErrors = ValidatePasswordWithMessages(input.NewPassword);
                if (passwordValidationErrors.Any())
                {
                    var combined = string.Join(" ", passwordValidationErrors);
                    _logger.LogInformation("Password validation failed for {Email}: {Errors}", input.Email, combined);
                    return BadRequest(new SolarAuthResponse { Success = false, Message = combined });
                }

                // Also run configured Identity password validators to keep in sync with system policy
                var identityErrors = new System.Collections.Generic.List<string>();
                foreach (var validator in _userManager.PasswordValidators)
                {
                    var validationResult = await validator.ValidateAsync(_userManager, user, input.NewPassword);
                    if (!validationResult.Succeeded)
                        identityErrors.AddRange(validationResult.Errors.Select(e => e.Description));
                }

                if (identityErrors.Any())
                {
                    var combined = string.Join(" ", identityErrors.Distinct());
                    _logger.LogInformation("Identity password validators failed for {Email}: {Errors}", input.Email, combined);
                    return BadRequest(new SolarAuthResponse { Success = false, Message = combined });
                }

                var realToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, realToken, input.NewPassword);

                if (result.Succeeded)
                {
                    await resetCache.RemoveAsync(input.Email);
                    await attemptsCache.RemoveAsync(input.Email);
                    _logger.LogInformation("Password reset succeeded for {Email}", input.Email);
                    return Ok(new SolarAuthResponse { Success = true, Message = "Password Changed Successfully!" });
                }
                else
                {
                    var error = result.Errors.FirstOrDefault()?.Description ?? "Unknown error";
                    _logger.LogWarning("Password reset failed for {Email}: {Error}", input.Email, error);
                    return BadRequest(new SolarAuthResponse { Success = false, Message = error });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while resetting password for {Email}", input.Email);
                return StatusCode(500, new SolarAuthResponse { Success = false, Message = "An unexpected error occurred." });
            }
        }

        private static string GenerateSixDigitCode()
        {
            int code = RandomNumberGenerator.GetInt32(0, 1_000_000);
            return code.ToString("D6");
        }

        private static string HashString(string input)
        {
            using (var sha = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input ?? string.Empty);
                var hash = sha.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        private static bool ConstantTimeEquals(string a, string b)
        {
            if (a == null || b == null) return false;
            if (a.Length != b.Length) return false;

            int diff = 0;
            for (int i = 0; i < a.Length; i++)
                diff |= a[i] ^ b[i];

            return diff == 0;
        }

        // Returns a list of human-friendly validation messages (empty list means password is valid)
        private static System.Collections.Generic.List<string> ValidatePasswordWithMessages(string password)
        {
            var errors = new System.Collections.Generic.List<string>();

            if (string.IsNullOrEmpty(password))
            {
                errors.Add("Password is required.");
                return errors;
            }

            // Minimum length
            const int minLength = 6;
            if (password.Length < minLength)
                errors.Add($"Password must be at least {minLength} characters long.");

            // Uppercase letter
            if (!Regex.IsMatch(password, "[A-Z]"))
                errors.Add("Password must contain at least one uppercase letter (A-Z).");

            // Lowercase letter
            if (!Regex.IsMatch(password, "[a-z]"))
                errors.Add("Password must contain at least one lowercase letter (a-z).");

            // Digit
            if (!Regex.IsMatch(password, "[0-9]"))
                errors.Add("Password must contain at least one digit (0-9).");

            // Special character
            if (!Regex.IsMatch(password, @"[\W_]"))
                errors.Add("Password must contain at least one special character (e.g. !@#$%^&*).");

            return errors;
        }
    }

    // DTO Classes (kept in-file by request, with validation attributes)
    public class SolarAuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Result { get; set; }
    }

    public class SolarForgotPasswordInput
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class SolarResetPasswordInput
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        public string NewPassword { get; set; }
    }
}