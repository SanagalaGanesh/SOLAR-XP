using System.Collections.Generic;

namespace core.Solar.Dto
{
    // Common Message Wrapper
    public class MessageDto
    {
        public string Message { get; set; }
    }

    // Dashboard DTOs used inside Manager
    public class UserQuoteDto
    {
        public int HeaderId { get; set; }
        public string Date { get; set; }
        public string Address { get; set; }
        public List<UserQuoteItemDto> Items { get; set; }
    }

    public class UserQuoteItemDto
    {
        public int ItemId { get; set; }
        public string Product { get; set; }
        public string Price { get; set; }
        public string Status { get; set; }
        public bool CanBuy { get; set; }
    }

    public class AdminRequestDto
    {
        public int HeaderId { get; set; }
        public string CustomerName { get; set; }
        public string Mobile { get; set; }
        public string Address { get; set; }
        public string Date { get; set; }
        public string TotalAmount { get; set; }
        public List<AdminRequestItemDto> Items { get; set; }
    }

    public class AdminRequestItemDto
    {
        public int ItemId { get; set; }
        public string ProductName { get; set; }
        public string Price { get; set; }
        public bool IsApproved { get; set; }
    }

    public class AdminOrderDto
    {
        public int OrderId { get; set; }
        public string CustomerName { get; set; }
        public string Mobile { get; set; }
        public string Address { get; set; }
        public string ModelName { get; set; }
        public string Amount { get; set; }
        public string Status { get; set; }
        public string Date { get; set; }
    }
}