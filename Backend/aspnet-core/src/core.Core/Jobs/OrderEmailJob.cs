using Abp.BackgroundJobs;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using core.SolarEntities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Net;
using System.Net.Mail; 

namespace core.Jobs
{
    public class OrderEmailJob : BackgroundJob<int>, ITransientDependency
    {
        private readonly IRepository<ClientOrder> _orderRepo;

 
        private const string SmtpHost = "smtp.gmail.com";
        private const int SmtpPort = 587;
        private const string SenderEmail = "sanagalaganesh26@gmail.com"; 
        private const string SenderPassword = "frublhbxmoijcvug"; 

        public OrderEmailJob(IRepository<ClientOrder> orderRepo)
        {
            _orderRepo = orderRepo;
        }

        [UnitOfWork]
        public override void Execute(int orderId)
        {
            // 1. Get Order Data
            var order = _orderRepo.GetAll()
                                  .Include(o => o.QuoteItem).ThenInclude(i => i.QuoteHeader).ThenInclude(h => h.User)
                                  .Include(o => o.QuoteItem).ThenInclude(i => i.SolarProduct)
                                  .FirstOrDefault(o => o.Id == orderId);

            if (order == null || order.QuoteItem?.QuoteHeader?.User == null) return;

            // 2. Prepare Data
            var userEmail = order.QuoteItem.QuoteHeader.User.EmailAddress;
            var userName = order.QuoteItem.QuoteHeader.User.Name;
            var productName = $"{order.QuoteItem.SolarProduct.Type} - {order.QuoteItem.SolarProduct.Watt}W";
            var price = order.QuoteItem.CalculatedPrice.ToString("N0");
            var orderDate = order.OrderDate.ToString("dd-MMM-yyyy");

            // 3. Email Body
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;'>
                    <h2 style='color: #28a745;'>Order Placed Successfully! ✅</h2>
                    <p>Hello <strong>{userName}</strong>,</p>
                    <p>Thank you for choosing SolarXP! Order Details:</p>
                    <ul>
                        <li><strong>Order ID:</strong> #{order.Id}</li>
                        <li><strong>Product:</strong> {productName}</li>
                        <li><strong>Amount:</strong> ₹{price}</li>
                    </ul>
                    <p>Regards,<br><strong>SolarXP Team</strong></p>
                </div>
            ";

            // 4. DIRECT SENDING LOGIC (Bypassing ABP Config)
            try
            {
                using (var client = new SmtpClient(SmtpHost, SmtpPort))
                {
                    client.EnableSsl = true;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(SenderEmail, SenderPassword);

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(SenderEmail, "SolarXP Admin"),
                        Subject = "SolarXP Order Confirmation 🌞",
                        Body = emailBody,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(userEmail);

                    client.Send(mailMessage);
                }
            }
            catch (System.Exception ex)
            {
                // Log error if needed, but don't stop the app
                System.Console.WriteLine("Email Error: " + ex.Message);
            }
        }
    }
}