using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class Event
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int VenueId { get; set; }

    [Required]
    [MaxLength(150)]
    public required string Title { get; set; }

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    // Authoritative Validation: Capacity must never exceed Venue.Capacity
    [Required]
    public int Capacity { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    // Navigation property
    [ForeignKey(nameof(VenueId))]
    public Venue? Venue { get; set; }
}
