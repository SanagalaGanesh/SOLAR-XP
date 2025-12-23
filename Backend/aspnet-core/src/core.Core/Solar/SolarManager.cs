using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.UI;
using core.SolarEntities;
using core.Authorization.Users; // User details kosam
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace core.Solar
{
    public class SolarManager : DomainService
    {
        private readonly IRepository<QuoteHeader> _headerRepo;
        private readonly IRepository<QuoteItem> _itemRepo;
        private readonly IRepository<SolarProduct> _productRepo;
        private readonly IRepository<ClientOrder> _orderRepo;

        public SolarManager(
            IRepository<QuoteHeader> headerRepo,
            IRepository<QuoteItem> itemRepo,
            IRepository<SolarProduct> productRepo,
            IRepository<ClientOrder> orderRepo)
        {
            _headerRepo = headerRepo;
            _itemRepo = itemRepo;
            _productRepo = productRepo;
            _orderRepo = orderRepo;
        }

        // 1. CUSTOMER: SUBMIT QUOTE
        public async Task<string> SubmitQuoteAsync(long userId, string mobile, string addressLine1, string addressLine2, List<string> selectedTypes, List<int> selectedWatts)
        {
            if (selectedTypes == null || !selectedTypes.Any()) throw new UserFriendlyException("Select at least one Panel Type!");
            if (selectedWatts == null || !selectedWatts.Any()) throw new UserFriendlyException("Select at least one Wattage!");

            var header = new QuoteHeader
            {
                UserId = userId,
                Mobile = mobile,
                AddressLine1 = addressLine1,
                AddressLine2 = addressLine2,
                CreationTime = DateTime.Now
            };
            int headerId = await _headerRepo.InsertAndGetIdAsync(header);

            foreach (var type in selectedTypes)
            {
                foreach (var watt in selectedWatts)
                {
                    var product = await _productRepo.FirstOrDefaultAsync(p => p.Type == type && p.Watt == watt);
                    if (product != null)
                    {
                        decimal locationCharge = product.Watt * 10;
                        decimal finalPrice = (product.BasePrice + locationCharge) - product.Subsidy;

                        var item = new QuoteItem
                        {
                            QuoteHeaderId = headerId,
                            SolarProductId = product.Id,
                            CalculatedPrice = finalPrice,
                            IsApproved = false,
                            Status = "Pending"
                        };
                        await _itemRepo.InsertAsync(item);
                    }
                }
            }
            return $"Success! Quote Submitted. ID: {headerId}";
        }

        // 2. ADMIN: GET ADMIN REQUESTS
        public object GetAdminRequests(string statusType)
        {
            var query = _headerRepo.GetAll()
                        .Include(h => h.User) // Include User to get Name
                        .Include(h => h.QuoteItems).ThenInclude(i => i.SolarProduct)
                        .OrderByDescending(h => h.CreationTime)
                        .AsQueryable();

            if (statusType == "Pending")
            {
                // Logic: Ee request lo okka item pending unna, adi pending kindhe vastundi
                query = query.Where(h => h.QuoteItems.Any(i => !i.IsApproved));
            }
            else if (statusType == "Approved")
            {
                // Logic: Anni items approve ayyi undali
                query = query.Where(h => h.QuoteItems.All(i => i.IsApproved) && h.QuoteItems.Count > 0);
            }

            var list = query.ToList();

            return list.Select(h => new
            {
                HeaderId = h.Id,
                CustomerName = h.User != null ? (h.User.Name + " " + h.User.Surname) : "Guest",
                Mobile = h.Mobile,
                Address = $"{h.AddressLine1}, {h.AddressLine2}", // Full Address
                Date = h.CreationTime.ToString("dd-MMM-yyyy"),

                // Total Value of this Quote
                TotalAmount = h.QuoteItems.Sum(i => i.CalculatedPrice).ToString("N0"),

                Items = h.QuoteItems.Select(i => new
                {
                    ItemId = i.Id,
                    ProductName = $"{i.SolarProduct.Type} - {i.SolarProduct.Watt}W",
                    Price = i.CalculatedPrice.ToString("N0"),
                    IsApproved = i.IsApproved
                }).ToList()
            }).ToList();
        }

        // 3. ADMIN: APPROVE WHOLE QUOTE (Header Click -> Approve All)
        public async Task<string> ApproveQuoteHeaderAsync(int headerId)
        {
            var items = await _itemRepo.GetAllListAsync(x => x.QuoteHeaderId == headerId);

            if (items == null || items.Count == 0)
                throw new UserFriendlyException("No items found for this request!");

            foreach (var item in items)
            {
                // Okka click tho anni items approve ayipotayi
                item.IsApproved = true;
                item.Status = "Approved";
                // Repository changes automatic ga save avutayi (UnitOfWork)
            }

            return "Quote Request Fully Approved!";
        }

        // 4. ADMIN: GET ALL ORDERS (For Orders Tab)
        public object GetAdminOrders()
        {
            var orders = _orderRepo.GetAll()
                          .Include(o => o.QuoteItem).ThenInclude(i => i.SolarProduct)
                          .Include(o => o.QuoteItem).ThenInclude(i => i.QuoteHeader).ThenInclude(h => h.User)
                          .OrderByDescending(o => o.OrderDate)
                          .ToList();

            return orders.Select(o => new
            {
                OrderId = o.Id,
                CustomerName = o.QuoteItem.QuoteHeader.User != null ? (o.QuoteItem.QuoteHeader.User.Name + " " + o.QuoteItem.QuoteHeader.User.Surname) : "Unknown",
                Mobile = o.QuoteItem.QuoteHeader.Mobile,
                Address = o.QuoteItem.QuoteHeader.AddressLine2, // City mainly
                ModelName = $"{o.QuoteItem.SolarProduct.Type} - {o.QuoteItem.SolarProduct.Watt}W",
                Amount = o.QuoteItem.CalculatedPrice.ToString("N0"),
                Status = o.OrderStatus,
                Date = o.OrderDate.ToString("dd-MMM-yyyy")
            }).ToList();
        }

        // 5. CUSTOMER: GET MY QUOTES
        public object GetMyQuotes(long userId)
        {
            var query = _headerRepo.GetAll()
                        .Include(h => h.QuoteItems)
                        .ThenInclude(i => i.SolarProduct)
                        .Where(h => h.UserId == userId)
                        .OrderByDescending(h => h.CreationTime)
                        .ToList();

            return query.Select(h => new
            {
                HeaderId = h.Id,
                Date = h.CreationTime.ToString("dd-MMM-yyyy"),
                Address = h.AddressLine1 + ", " + h.AddressLine2,

                Items = h.QuoteItems.Select(i => new
                {
                    ItemId = i.Id,
                    Product = $"{i.SolarProduct.Type} - {i.SolarProduct.Watt}W",

                    // Show price only if approved
                    Price = i.IsApproved ? i.CalculatedPrice.ToString("N0") : "TBD",

                    Status = i.Status,
                    CanBuy = i.IsApproved && i.Status != "Ordered"
                }).ToList()
            }).ToList();
        }

        // 6. CUSTOMER: PLACE ORDERS
        public async Task<string> PlaceOrderAsync(int itemId)
        {
            var item = await _itemRepo.GetAsync(itemId);

            if (!item.IsApproved) throw new UserFriendlyException("Price not approved yet!");
            if (item.Status == "Ordered") throw new UserFriendlyException("Already ordered!");

            var order = new ClientOrder
            {
                QuoteItemId = itemId,
                OrderDate = DateTime.Now,
                OrderStatus = "Placed"
            };
            await _orderRepo.InsertAsync(order);

            item.Status = "Ordered";
            await _itemRepo.UpdateAsync(item);

            return "Order Placed Successfully!";
        }

        // =========================================================
        // 7. PRODUCT CRUD OPERATIONS (ADDED AS REQUESTED)
        // =========================================================

        // A. GET ALL PRODUCTS
        public List<SolarProduct> GetAllProducts()
        {
            return _productRepo.GetAll()
                               .OrderBy(p => p.Type)
                               .ThenBy(p => p.Watt)
                               .ToList();
        }

        // B. GET PRODUCT BY ID
        public async Task<SolarProduct> GetProductByIdAsync(int id)
        {
            var product = await _productRepo.FirstOrDefaultAsync(id);
            if (product == null) throw new UserFriendlyException("Product not found!");
            return product;
        }

        // C. CREATE PRODUCT
        public async Task CreateProductAsync(string type, int watt, decimal basePrice, decimal subsidy)
        {
            // Check for duplicates
            var existing = await _productRepo.FirstOrDefaultAsync(p => p.Type == type && p.Watt == watt);
            if (existing != null) throw new UserFriendlyException("Product with this Type and Wattage already exists!");

            var product = new SolarProduct
            {
                Type = type,
                Watt = watt,
                BasePrice = basePrice,
                Subsidy = subsidy
            };

            await _productRepo.InsertAsync(product);
        }

        // D. UPDATE PRODUCT
        public async Task UpdateProductAsync(int id, string type, int watt, decimal basePrice, decimal subsidy)
        {
            var product = await _productRepo.GetAsync(id);
            if (product == null) throw new UserFriendlyException("Product not found!");

            product.Type = type;
            product.Watt = watt;
            product.BasePrice = basePrice;
            product.Subsidy = subsidy;

            await _productRepo.UpdateAsync(product);
        }

        // E. DELETE PRODUCT
        public async Task DeleteProductAsync(int id)
        {
            // Optional: Check if used in any QuoteItems before deleting to avoid errors
            var isUsed = await _itemRepo.CountAsync(i => i.SolarProductId == id);
            if (isUsed > 0)
            {
                throw new UserFriendlyException("Cannot delete this product as it is linked to existing Customer Quotes.");
            }

            await _productRepo.DeleteAsync(id);
        }
    }
}