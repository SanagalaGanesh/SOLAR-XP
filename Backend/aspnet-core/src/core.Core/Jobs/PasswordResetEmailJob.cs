using Abp.BackgroundJobs;
using Abp.Dependency;
using System.Net;
using System.Net.Mail;

namespace core.Jobs
{
    // Arguments class (Email + Code pass cheyadaniki)
    public class PasswordResetArgs
    {
        public string TargetEmail { get; set; }
        public string Code { get; set; }
    }

    public class PasswordResetEmailJob : BackgroundJob<PasswordResetArgs>, ITransientDependency
    {
        // Gmail Configuration (Replace with your details)
        private const string SmtpHost = "smtp.gmail.com";
        private const int SmtpPort = 587;
        private const string SenderEmail = "sanagalaganesh26@gmail.com"; 
        private const string SenderPassword = "frublhbxmoijcvug";

        public override void Execute(PasswordResetArgs args)
        {
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;'>
                    <h2 style='color: #007bff;'>Password Reset Request 🔐</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your SolarXP password.</p>
                    <p>Your Verification Code is:</p>
                    
                    <h1 style='background-color: #f2f2f2; padding: 10px; display: inline-block; letter-spacing: 5px;'>
                        {args.Code}
                    </h1>

                    <p>This code is valid for <strong>10 minutes</strong>.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <br>
                    <p>Regards,<br><strong>SolarXP Security Team</strong></p>
                </div>
            ";

            try
            {
                using (var client = new SmtpClient(SmtpHost, SmtpPort))
                {
                    client.EnableSsl = true;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(SenderEmail, SenderPassword);

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(SenderEmail, "SolarXP Security"),
                        Subject = "Reset Your Password - SolarXP",
                        Body = emailBody,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(args.TargetEmail);

                    client.Send(mailMessage);
                }
            }
            catch (System.Exception ex)
            {
                // Log error
                System.Console.WriteLine("Email Error: " + ex.Message);
            }
        }
    }
}