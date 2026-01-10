using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Microsoft.AspNetCore.Authorization;
using core.Solar.Dto;
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

        // =========================================================
        // CUSTOMER ACTIONS
        // =========================================================

        public async Task<MessageDto> SubmitQuote(SubmitQuoteInput input)
        {
            // Manager returns string, we wrap it in MessageDto
            string result = await _solarManager.SubmitQuoteAsync(
                input.UserId, input.Mobile, input.AddressLine1, input.AddressLine2,
                input.SelectedTypes, input.SelectedWatts
            );
            return new MessageDto { Message = result };
        }

        public List<UserQuoteDto> GetMyQuotes(long userId)
        {
            // Manager logic untouched, direct pass-through
            return _solarManager.GetMyQuotes(userId);
        }

        public async Task<MessageDto> PlaceOrder(ItemInputDto input)
        {
            string result = await _solarManager.PlaceOrderAsync(input.ItemId);
            return new MessageDto { Message = result };
        }

        public async Task<List<SolarProductDto>> GetAllProducts()
        {
            // Manager logic untouched
            var products = await _solarManager.GetAllProducts();
            return ObjectMapper.Map<List<SolarProductDto>>(products);
        }

        // =========================================================
        // ADMIN ACTIONS
        // =========================================================

        [Authorize(Roles = "Admin")]
        public List<AdminRequestDto> GetAdminRequests(string status)
        {
            return _solarManager.GetAdminRequests(status);
        }

        [Authorize(Roles = "Admin")]
        public List<AdminOrderDto> GetAdminOrders()
        {
            return _solarManager.GetAdminOrders();
        }

        [Authorize(Roles = "Admin")]
        public async Task<MessageDto> ApproveQuoteHeader(EntityDto input)
        {
            string result = await _solarManager.ApproveQuoteHeaderAsync(input.Id);
            return new MessageDto { Message = result };
        }

        // =========================================================
        // PRODUCT CRUD (ADMIN)
        // =========================================================

        [Authorize(Roles = "Admin")]
        public async Task<SolarProductDto> GetProduct(EntityDto input)
        {
            var product = await _solarManager.GetProductByIdAsync(input.Id);
            return ObjectMapper.Map<SolarProductDto>(product);
        }

        [Authorize(Roles = "Admin")]
        public async Task<MessageDto> CreateProduct(CreateSolarProductDto input)
        {
            // Using logic from your manager snippet: Manager CreateProductAsync takes (type, watt...)
            // So we pass individual fields
            await _solarManager.CreateProductAsync(input.Type, input.Watt, input.BasePrice, input.Subsidy);
            return new MessageDto { Message = "Product Created Successfully!" };
        }

        [Authorize(Roles = "Admin")]
        public async Task<MessageDto> UpdateProduct(SolarProductDto input)
        {
            await _solarManager.UpdateProductAsync(input.Id, input.Type, input.Watt, input.BasePrice, input.Subsidy);
            return new MessageDto { Message = "Product Updated Successfully!" };
        }

        [Authorize(Roles = "Admin")]
        public async Task<MessageDto> DeleteProduct(EntityDto input)
        {
            await _solarManager.DeleteProductAsync(input.Id);
            return new MessageDto { Message = "Product Deleted Successfully!" };
        }
    }
}