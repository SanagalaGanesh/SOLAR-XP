using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace core.SolarEntities
{
    [Table("ClientOrders")]
    public class ClientOrder : FullAuditedEntity
    {
        // Link to the Approved Quote Item
        public int QuoteItemId { get; set; }
        [ForeignKey("QuoteItemId")]
        public QuoteItem QuoteItem { get; set; }

        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; } // "Placed"
    }
}