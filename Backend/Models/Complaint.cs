using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class Complaint
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(1000)]
    public required string Description { get; set; }

    // Status progression: Pending -> In Progress -> Resolved (BRD Section 4, Module 5)
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    // Provided by administrators during resolution
    [MaxLength(1000)]
    public string? ResolutionNote { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties for Entity Framework Core relationship mapping
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public ComplaintCategory? Category { get; set; }
}
