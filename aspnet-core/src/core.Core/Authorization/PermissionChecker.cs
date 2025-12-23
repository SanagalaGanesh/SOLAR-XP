using Abp.Authorization;
using core.Authorization.Roles;
using core.Authorization.Users;

namespace core.Authorization;

public class PermissionChecker : PermissionChecker<Role, User>
{
    public PermissionChecker(UserManager userManager)
        : base(userManager)
    {
    }
}
