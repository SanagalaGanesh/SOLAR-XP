using System.ComponentModel.DataAnnotations;

namespace core.Users.Dto;

public class ChangeUserLanguageDto
{
    [Required]
    public string LanguageName { get; set; }
}