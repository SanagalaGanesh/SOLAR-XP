using Abp.Application.Services;
using Abp.Authorization;
using core.Authorization;
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

        // ==========================================
        // EXISTING FUNCTIONALITIES (Quotes & Orders)
        // ==========================================

        // 1. Submit Quote 
        public async Task<object> SubmitQuote(SubmitInput input)
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
        public async Task<object> ApproveQuoteHeader(SimpleIdInput input)
        {
            string result = await _solarManager.ApproveQuoteHeaderAsync(input.Id);
            return new { message = result };
        }

        public object GetMyQuotes(long userId)
        {
            return _solarManager.GetMyQuotes(userId);
        }

        public async Task<object> PlaceOrder(ItemInput input)
        {
            string result = await _solarManager.PlaceOrderAsync(input.ItemId);
            return new { message = result };
        }

        // ==========================================
        // NEW: PRODUCT CRUD OPERATIONS (Admin Only)
        // ==========================================

        [Authorize(Roles = "Admin")]
        public object GetAllProducts()
        {
            return _solarManager.GetAllProducts();
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> GetProduct(SimpleIdInput input)
        {
            return await _solarManager.GetProductByIdAsync(input.Id);
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> CreateProduct(CreateProductInput input)
        {
            await _solarManager.CreateProductAsync(input.Type, input.Watt, input.BasePrice, input.Subsidy);
            return new { message = "Product Created Successfully!" };
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> UpdateProduct(UpdateProductInput input)
        {
            await _solarManager.UpdateProductAsync(input.Id, input.Type, input.Watt, input.BasePrice, input.Subsidy);
            return new { message = "Product Updated Successfully!" };
        }

        [Authorize(Roles = "Admin")]
        public async Task<object> DeleteProduct(SimpleIdInput input)
        {
            await _solarManager.DeleteProductAsync(input.Id);
            return new { message = "Product Deleted Successfully!" };
        }
    }

    // ==========================================
    // DTO CLASSES (Input Models)
    // ==========================================

    public class SubmitInput
    {
        public long UserId { get; set; }
        public string Mobile { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public List<string> SelectedTypes { get; set; }
        public List<int> SelectedWatts { get; set; }
    }

    public class ItemInput
    {
        public int ItemId { get; set; }
    }

    public class SimpleIdInput
    {
        public int Id { get; set; }
    }

    // New DTOs for Products
    public class CreateProductInput
    {
        public string Type { get; set; } // Solar Thin, Poly, Mono
        public int Watt { get; set; }    // 450, 850, 1000
        public decimal BasePrice { get; set; }
        public decimal Subsidy { get; set; }
    }

    public class UpdateProductInput
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public int Watt { get; set; }
        public decimal BasePrice { get; set; }
        public decimal Subsidy { get; set; }
    }
}