using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.Models;

public class Faculty
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; } // e.g., "Faculty of Computing", "Faculty of Engineering"

    // BRD Rule: A Faculty cannot be deleted while students are linked to it. 
    // Deactivate it instead.
    public bool IsActive { get; set; } = true;
}
