using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class Room
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HostelId { get; set; }

    [Required]
    [MaxLength(20)]
    public required string RoomNumber { get; set; }

    [Required]
    public int MaxCapacity { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation properties for EF Core relationships
    [ForeignKey(nameof(HostelId))]
    public Hostel? Hostel { get; set; }
}
