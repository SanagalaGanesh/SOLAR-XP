using Abp.AutoMapper;
using core.SolarEntities; // <--- Correct Namespace
using System.ComponentModel.DataAnnotations;

namespace core.Solar.Dto
{
    [AutoMapTo(typeof(SolarProduct))]
    public class CreateSolarProductDto
    {
        [Required]
        public string Type { get; set; }

        [Required]
        public int Watt { get; set; }

        [Required]
        public decimal BasePrice { get; set; }

        public decimal Subsidy { get; set; }
    }
}