using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.Models;

public class Venue
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    // Valid values from BRD: "Event Hall" or "Open Space"
    [Required]
    [MaxLength(30)]
    public required string Type { get; set; }

    [Required]
    public int Capacity { get; set; }

    public bool IsActive { get; set; } = true;
}
