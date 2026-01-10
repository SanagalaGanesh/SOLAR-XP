using Abp.Application.Services.Dto;
using Abp.AutoMapper; // Ensure Abp.AutoMapper package is installed in Core
using core.SolarEntities;

namespace core.Solar.Dto
{
    [AutoMapFrom(typeof(SolarProduct))]
    public class SolarProductDto : EntityDto
    {
        public string Type { get; set; }
        public int Watt { get; set; }
        public decimal BasePrice { get; set; }
        public decimal Subsidy { get; set; }
    }

    [AutoMapTo(typeof(SolarProduct))]
    public class CreateSolarProductDto
    {
        public string Type { get; set; }
        public int Watt { get; set; }
        public decimal BasePrice { get; set; }
        public decimal Subsidy { get; set; }
    }
}