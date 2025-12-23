using Abp.Domain.Entities.Auditing;
using core.Authorization.Users; 
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace core.SolarEntities
{
    [Table("QuoteHeaders")]
    public class QuoteHeader : FullAuditedEntity
    {
        public long UserId { get; set; }

    
        [ForeignKey("UserId")]
        public User User { get; set; }
       

        public string Mobile { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }

        public List<QuoteItem> QuoteItems { get; set; }
    }
}