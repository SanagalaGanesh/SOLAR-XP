using core.Roles.Dto;
using System.Collections.Generic;

namespace core.Web.Models.Roles;

public class RoleListViewModel
{
    public IReadOnlyList<PermissionDto> Permissions { get; set; }
}
