using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.Models;

public class SystemSetting
{
    [Key]
    [MaxLength(100)]
    public required string SettingKey { get; set; } // e.g., "reservation-hold-minutes"

    [Required]
    [MaxLength(100)]
    public required string SettingValue { get; set; } // e.g., "15"
}
