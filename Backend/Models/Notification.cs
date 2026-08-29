using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    // BRD Rule: Must carry an explicit action type tag (e.g., HostelApproved, ComplaintUpdated)
    [Required]
    [MaxLength(50)]
    public required string Type { get; set; }

    [Required]
    [MaxLength(500)]
    public required string Message { get; set; }

    public bool IsRead { get; set; } = false;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property for Entity Framework Core relationship mapping
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }
}
