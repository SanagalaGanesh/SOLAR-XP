using Abp.Authorization;
using Abp.Runtime.Session;
using core.Configuration.Dto;
using System.Threading.Tasks;

namespace core.Configuration;

[AbpAuthorize]
public class ConfigurationAppService : coreAppServiceBase, IConfigurationAppService
{
    public async Task ChangeUiTheme(ChangeUiThemeInput input)
    {
        await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
    }
}
