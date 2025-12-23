using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace core.SolarEntities
{
    [Table("QuoteItems")]
    public class QuoteItem : FullAuditedEntity
    {
        // Link to Parent Header
        public int QuoteHeaderId { get; set; }
        [ForeignKey("QuoteHeaderId")]
        public QuoteHeader QuoteHeader { get; set; }

        // Link to Product (Poly-450 etc)
        public int SolarProductId { get; set; }
        [ForeignKey("SolarProductId")]
        public SolarProduct SolarProduct { get; set; }

        // IMP: Price submit appude calculate avtundi
        public decimal CalculatedPrice { get; set; }

        // IMP: Admin approve chese varaku idi False untundi
        public bool IsApproved { get; set; } // Default: False

        public string Status { get; set; } // "Pending", "Approved", "Ordered"
    }
}
