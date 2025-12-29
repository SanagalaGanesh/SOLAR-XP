using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using core.Authorization;
using core.Solar.Dto;
using core.SolarEntities;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace core.Solar
{
    [AbpAuthorize]
    public class SolarAppService : ApplicationService
    {
        private readonly SolarManager _solarManager;

        public SolarAppService(SolarManager solarManager)
        {
            _solarManager = solarManager;
        }

        // 1. Submit Quote 
        public async Task<object> SubmitQuote(SubmitQuoteInput input)
        {
            string result = await _solarManager.SubmitQuoteAsync(
                input.UserId,
                input.Mobile,
                input.AddressLine1,
                input.AddressLine2,
                input.SelectedTypes,
                input.SelectedWatts
            );

            return new { message = result };
        }

        [Authorize(Roles = "Admin")]
        public object GetAdminRequests(string status)
        {
            return _solarManager.GetAdminRequests(status);
        }

        [Authorize(Roles = "Admin")]
        public object GetAdminOrders()
        {
            return _solarManager.GetAdminOrders();
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> ApproveQuoteHeader(EntityDto input)
        {
            string result = await _solarManager.ApproveQuoteHeaderAsync(input.Id);
            return new { message = result };
        }

        public object GetMyQuotes(long userId)
        {
            return _solarManager.GetMyQuotes(userId);
        }

        public async Task<object> PlaceOrder(ItemInputDto input)
        {
            string result = await _solarManager.PlaceOrderAsync(input.ItemId);
            return new { message = result };
        }


        [Authorize(Roles = "Admin")]
        public async Task<List<SolarProductDto>> GetAllProducts()
        {
            var products = await _solarManager.GetAllProducts();
            return ObjectMapper.Map<List<SolarProductDto>>(products);
        }

        [Authorize(Roles = "Admin")]
        public async Task<SolarProductDto> GetProduct(EntityDto input)
        {
            var product = await _solarManager.GetProductByIdAsync(input.Id);
            return ObjectMapper.Map<SolarProductDto>(product);
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> CreateProduct(CreateSolarProductDto input)
        {
            await _solarManager.CreateProductAsync(input.Type, input.Watt, input.BasePrice, input.Subsidy);
            return new { message = "Product Created Successfully!" };
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> UpdateProduct(SolarProductDto input)
        {
            await _solarManager.UpdateProductAsync(input.Id, input.Type, input.Watt, input.BasePrice, input.Subsidy);
            return new { message = "Product Updated Successfully!" };
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> DeleteProduct(EntityDto input)
        {
            await _solarManager.DeleteProductAsync(input.Id);
            return new { message = "Product Deleted Successfully!" };
        }
    }
}