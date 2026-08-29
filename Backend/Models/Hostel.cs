using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.Models;

public class Hostel
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }


    // Hard-deleting blocks if active dependencies exist, otherwise toggled to false (BRD Module 2)
    public bool IsActive { get; set; } = true;

    // Navigation property for EF Core
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}
