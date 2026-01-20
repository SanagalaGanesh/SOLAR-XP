using Abp.BackgroundJobs; 
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Runtime.Caching;
using Abp.UI;
using core.Jobs; 
using core.Solar.Dto; 
using core.SolarEntities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace core.Solar
{
    public enum QuoteStatus
    {
        Pending,
        Approved,
        Ordered
    }

    public class SolarManager : DomainService
    {
        private readonly IRepository<QuoteHeader> _headerRepo;
        private readonly IRepository<QuoteItem> _itemRepo;
        private readonly IRepository<SolarProduct> _productRepo;
        private readonly IRepository<ClientOrder> _orderRepo;
        private readonly ICacheManager _cacheManager;
        private readonly IBackgroundJobManager _backgroundJobManager; 

        private const string Cache_Products = "SolarProductsCache";
        private const string Cache_UserQuotes = "UserQuotesCache";
        private const string CacheKey_AllProducts = "AllProductsList";
        private const decimal LocationChargePerWatt = 20;

        public SolarManager(
            IRepository<QuoteHeader> headerRepo,
            IRepository<QuoteItem> itemRepo,
            IRepository<SolarProduct> productRepo,
            IRepository<ClientOrder> orderRepo,
            ICacheManager cacheManager,
            IBackgroundJobManager backgroundJobManager) 
        {
            _headerRepo = headerRepo;
            _itemRepo = itemRepo;
            _productRepo = productRepo;
            _orderRepo = orderRepo;
            _cacheManager = cacheManager;
            _backgroundJobManager = backgroundJobManager; 
        }

        // =========================================================
        // 1. CUSTOMER: SUBMIT QUOTE
        // =========================================================
        public async Task<string> SubmitQuoteAsync(long userId, string mobile, string addressLine1, string addressLine2, List<string> selectedTypes, List<int> selectedWatts)
        {
            if (selectedTypes.IsNullOrEmpty()) throw new UserFriendlyException("Select at least one Panel Type!");
            if (selectedWatts.IsNullOrEmpty()) throw new UserFriendlyException("Select at least one Wattage!");

            var availableProducts = await _productRepo.GetAll()
                .Where(p => selectedTypes.Contains(p.Type) && selectedWatts.Contains(p.Watt))
                .ToListAsync();

            if (!availableProducts.Any())
                throw new UserFriendlyException("Selected Product Combinations not found in Database!");

            var header = new QuoteHeader
            {
                UserId = userId,
                Mobile = mobile,
                AddressLine1 = addressLine1,
                AddressLine2 = addressLine2,
                CreationTime = DateTime.Now,
                QuoteItems = new List<QuoteItem>()
            };

            foreach (var type in selectedTypes)
            {
                foreach (var watt in selectedWatts)
                {
                    var product = availableProducts.FirstOrDefault(p => p.Type == type && p.Watt == watt);

                    if (product != null)
                    {
                        decimal finalPrice = CalculateFinalPrice(product);

                        header.QuoteItems.Add(new QuoteItem
                        {
                            SolarProductId = product.Id,
                            CalculatedPrice = finalPrice,
                            IsApproved = false,
                            Status = QuoteStatus.Pending.ToString()
                        });
                    }
                }
            }

            if (!header.QuoteItems.Any())
                throw new UserFriendlyException("Failed to match any valid products.");

            int headerId = await _headerRepo.InsertAndGetIdAsync(header);

            // Invalidate Cache for this user
            await InvalidateUserCache(userId);

            return $"Success! Quote Submitted. ID: {headerId}";
        }

        // =========================================================
        // 2. ADMIN: GET REQUESTS (Returns DTO List)
        // =========================================================
        public List<AdminRequestDto> GetAdminRequests(string statusType)
        {
            var query = _headerRepo.GetAll()
                        .AsNoTracking()
                        .Include(h => h.User)
                        .Include(h => h.QuoteItems).ThenInclude(i => i.SolarProduct)
                        .OrderByDescending(h => h.CreationTime)
                        .AsQueryable();

            if (statusType == QuoteStatus.Pending.ToString())
            {
                query = query.Where(h => h.QuoteItems.Any(i => !i.IsApproved));
            }
            else if (statusType == QuoteStatus.Approved.ToString())
            {
                query = query.Where(h => h.QuoteItems.All(i => i.IsApproved) && h.QuoteItems.Count > 0);
            }

            // Mapping to DTO
            return query.Select(h => new AdminRequestDto
            {
                HeaderId = h.Id,
                CustomerName = h.User != null ? (h.User.Name + " " + h.User.Surname) : "Guest",
                Mobile = h.Mobile,
                Address = $"{h.AddressLine1}, {h.AddressLine2}",
                Date = h.CreationTime.ToString("dd-MMM-yyyy"),
                TotalAmount = h.QuoteItems.Sum(i => i.CalculatedPrice).ToString("N0"),
                Items = h.QuoteItems.Select(i => new AdminRequestItemDto
                {
                    ItemId = i.Id,
                    ProductName = $"{i.SolarProduct.Type} - {i.SolarProduct.Watt}W",
                    Price = i.CalculatedPrice.ToString("N0"),
                    IsApproved = i.IsApproved
                }).ToList()
            }).ToList();
        }

        // =========================================================
        // 3. ADMIN: APPROVE QUOTE
        // =========================================================
        public async Task<string> ApproveQuoteHeaderAsync(int headerId)
        {
            var header = await _headerRepo.GetAllIncluding(h => h.QuoteItems)
                                          .FirstOrDefaultAsync(h => h.Id == headerId);

            if (header == null) throw new UserFriendlyException("Request not found!");
            if (!header.QuoteItems.Any()) throw new UserFriendlyException("No items found!");

            foreach (var item in header.QuoteItems)
            {
                item.IsApproved = true;
                item.Status = QuoteStatus.Approved.ToString();
            }

            await InvalidateUserCache(header.UserId);

            return "Quote Request Fully Approved!";
        }

        // =========================================================
        // 4. ADMIN: GET ORDERS (Returns DTO List)
        // =========================================================
        public List<AdminOrderDto> GetAdminOrders()
        {
            return _orderRepo.GetAll()
                   .AsNoTracking()
                   .Include(o => o.QuoteItem).ThenInclude(i => i.SolarProduct)
                   .Include(o => o.QuoteItem).ThenInclude(i => i.QuoteHeader).ThenInclude(h => h.User)
                   .OrderByDescending(o => o.OrderDate)
                   .Select(o => new AdminOrderDto
                   {
                       OrderId = o.Id,
                       CustomerName = o.QuoteItem.QuoteHeader.User != null ? (o.QuoteItem.QuoteHeader.User.Name + " " + o.QuoteItem.QuoteHeader.User.Surname) : "Unknown",
                       Mobile = o.QuoteItem.QuoteHeader.Mobile,
                       Address = o.QuoteItem.QuoteHeader.AddressLine2,
                       ModelName = $"{o.QuoteItem.SolarProduct.Type} - {o.QuoteItem.SolarProduct.Watt}W",
                       Amount = o.QuoteItem.CalculatedPrice.ToString("N0"),
                       Status = o.OrderStatus,
                       Date = o.OrderDate.ToString("dd-MMM-yyyy")
                   }).ToList();
        }

        // =========================================================
        // 5. CUSTOMER: GET MY QUOTES (With Caching)
        // =========================================================
        public List<UserQuoteDto> GetMyQuotes(long userId)
        {
            string cacheKey = $"UserDashboard_{userId}";

            return (List<UserQuoteDto>)_cacheManager
                .GetCache(Cache_UserQuotes)
                .Get(cacheKey, (key) =>
                {
                    var query = _headerRepo.GetAll()
                                .AsNoTracking()
                                .Include(h => h.QuoteItems).ThenInclude(i => i.SolarProduct)
                                .Where(h => h.UserId == userId)
                                .OrderByDescending(h => h.CreationTime)
                                .ToList();

                    // Map to DTO
                    return query.Select(h => new UserQuoteDto
                    {
                        HeaderId = h.Id,
                        Date = h.CreationTime.ToString("dd-MMM-yyyy"),
                        Address = h.AddressLine1 + ", " + h.AddressLine2,
                        Items = h.QuoteItems.Select(i => new UserQuoteItemDto
                        {
                            ItemId = i.Id,
                            Product = $"{i.SolarProduct.Type} - {i.SolarProduct.Watt}W",
                            Price = i.IsApproved ? i.CalculatedPrice.ToString("N0") : "TBD",
                            Status = i.Status,
                            CanBuy = i.IsApproved && i.Status != QuoteStatus.Ordered.ToString()
                        }).ToList()
                    }).ToList();
                });
        }

        // =========================================================
        // 6. CUSTOMER: PLACE ORDER (UPDATED WITH EMAIL JOB 🚀)
        // =========================================================
        public async Task<string> PlaceOrderAsync(int itemId)
        {
            var item = await _itemRepo.GetAllIncluding(x => x.QuoteHeader)
                                      .FirstOrDefaultAsync(x => x.Id == itemId);

            if (item == null) throw new UserFriendlyException("Item not found!");
            if (!item.IsApproved) throw new UserFriendlyException("Price not approved yet!");

            if (item.Status == QuoteStatus.Ordered.ToString())
                throw new UserFriendlyException("Already ordered!");

            // 1. Save Order
            var order = new ClientOrder
            {
                QuoteItemId = itemId,
                OrderDate = DateTime.Now,
                OrderStatus = "Placed"
            };

            
            int orderId = await _orderRepo.InsertAndGetIdAsync(order);

            // 2. Update Status
            item.Status = QuoteStatus.Ordered.ToString();
            await _itemRepo.UpdateAsync(item);

            // 3. Clear Cache
            if (item.QuoteHeader != null)
            {
                await InvalidateUserCache(item.QuoteHeader.UserId);
            }

            // 4. TRIGGER EMAIL JOB (New Feature!)
            // Queue the email job in background
            await _backgroundJobManager.EnqueueAsync<OrderEmailJob, int>(orderId);

            return "Order Placed Successfully! Confirmation Email Sent.";
        }

        // =========================================================
        // 7. PRODUCT MANAGEMENT (CRUD)
        // =========================================================

        public async Task<List<SolarProduct>> GetAllProducts()
        {
            var cache = _cacheManager.GetCache(Cache_Products);
            var cached = await cache.GetAsync(CacheKey_AllProducts, async key =>
            {
                var products = await _productRepo.GetAll()
                                .AsNoTracking()
                                .OrderBy(p => p.Id)
                                .ToListAsync();
                return products;
            });

            return cached as List<SolarProduct>;
        }

        public async Task<SolarProduct> GetProductByIdAsync(int id)
        {
            var product = await _productRepo.FirstOrDefaultAsync(id);
            if (product == null) throw new UserFriendlyException("Product not found!");
            return product;
        }

        public async Task CreateProductAsync(string type, int watt, decimal basePrice, decimal subsidy)
        {
            var existing = await _productRepo.FirstOrDefaultAsync(p => p.Type == type && p.Watt == watt);
            if (existing != null) throw new UserFriendlyException("Product already exists!");

            await _productRepo.InsertAsync(new SolarProduct
            {
                Type = type,
                Watt = watt,
                BasePrice = basePrice,
                Subsidy = subsidy
            });

            await InvalidateProductsCache();
        }

        public async Task UpdateProductAsync(int id, string type, int watt, decimal basePrice, decimal subsidy)
        {
            var product = await _productRepo.GetAsync(id);
            if (product == null) throw new UserFriendlyException("Product not found!");

            product.Type = type;
            product.Watt = watt;
            product.BasePrice = basePrice;
            product.Subsidy = subsidy;
            await _productRepo.UpdateAsync(product);
            await InvalidateProductsCache();
        }

        public async Task DeleteProductAsync(int id)
        {
            var isUsed = await _itemRepo.CountAsync(i => i.SolarProductId == id);
            if (isUsed > 0) throw new UserFriendlyException("Cannot delete: Product used in existing quotes.");

            await _productRepo.DeleteAsync(id);
            await InvalidateProductsCache();
        }

        // =========================================================
        // PRIVATE HELPERS
        // =========================================================

        private decimal CalculateFinalPrice(SolarProduct product)
        {
            decimal locationCharge = product.Watt * LocationChargePerWatt;
            return (product.BasePrice + locationCharge) - product.Subsidy;
        }

        private async Task InvalidateUserCache(long userId)
        {
            await _cacheManager.GetCache(Cache_UserQuotes).RemoveAsync($"UserDashboard_{userId}");
        }

        private async Task InvalidateProductsCache()
        {
            await _cacheManager.GetCache(Cache_Products).ClearAsync();
        }
    }
}