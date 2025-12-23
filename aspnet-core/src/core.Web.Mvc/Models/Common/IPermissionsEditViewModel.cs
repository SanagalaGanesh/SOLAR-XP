using core.Roles.Dto;
using System.Collections.Generic;

namespace core.Web.Models.Common;

public interface IPermissionsEditViewModel
{
    List<FlatPermissionDto> Permissions { get; set; }
}