using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.Models;

public class ComplaintCategory
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    // BRD Rule: A category cannot be hard-deleted if complaints reference it. 
    // Toggle IsActive to false instead.
    public bool IsActive { get; set; } = true;
}
