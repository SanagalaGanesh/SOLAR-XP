using Abp.Application.Services;
using core.Authorization.Accounts.Dto;
using System.Threading.Tasks;

namespace core.Authorization.Accounts;

public interface IAccountAppService : IApplicationService
{
    Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

    Task<RegisterOutput> Register(RegisterInput input);
}
