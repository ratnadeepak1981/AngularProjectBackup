using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class EventRegistration
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int EventId { get; set; }

    [Required]
    public int StudentId { get; set; }

    // Status progression from BRD: Held -> Confirmed (or drops to Expired/Cancelled)
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Held";

    // Used by background worker cleanup jobs to drop abandoned holds
    [Required]
    public DateTime ExpiresAt { get; set; }

    // Navigation properties for EF Core relationships
    [ForeignKey(nameof(EventId))]
    public Event? Event { get; set; }

    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }
}
