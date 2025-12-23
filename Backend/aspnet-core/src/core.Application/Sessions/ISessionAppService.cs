using Abp.Application.Services;
using core.Sessions.Dto;
using System.Threading.Tasks;

namespace core.Sessions;

public interface ISessionAppService : IApplicationService
{
    Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
}
