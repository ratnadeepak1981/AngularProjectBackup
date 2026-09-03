using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class HostelApplication
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int PreferredHostelId { get; set; }

    [Required]
    [MaxLength(50)]
    public required string TermSemester { get; set; }

    [MaxLength(500)]
    public string? SpecialRequirements { get; set; }

    // Status progression: Pending -> Approved / Rejected -> RoomAssigned (BRD Section 6)
    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";

    public int? AssignedRoomId { get; set; }

    // Submission timestamp — consistent with all other application/request models
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties for EF Core relationship maps
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [ForeignKey(nameof(PreferredHostelId))]
    public Hostel? PreferredHostel { get; set; }

    [ForeignKey(nameof(AssignedRoomId))]
    public Room? AssignedRoom { get; set; }
}
