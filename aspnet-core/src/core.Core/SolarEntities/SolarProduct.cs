using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace core.SolarEntities
{
    [Table("SolarProducts")]
    public class SolarProduct : Entity
    {
        public string Type { get; set; } // Ex: "Poly", "Mono", "Thin"
        public int Watt { get; set; }    // Ex: 450, 850, 1000
        public decimal BasePrice { get; set; }
        public decimal Subsidy { get; set; }
    }
}