using Abp.Application.Services;
using core.MultiTenancy.Dto;

namespace core.MultiTenancy;

public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
{
}

