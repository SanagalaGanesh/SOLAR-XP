using core.Configuration.Dto;
using System.Threading.Tasks;

namespace core.Configuration;

public interface IConfigurationAppService
{
    Task ChangeUiTheme(ChangeUiThemeInput input);
}
