using core.Roles.Dto;
using System.Collections.Generic;

namespace core.Web.Models.Users;

public class UserListViewModel
{
    public IReadOnlyList<RoleDto> Roles { get; set; }
}
