using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class LabSeat
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int LabId { get; set; }

    [Required]
    [MaxLength(20)]
    public required string SeatNumber { get; set; } // e.g., "PC-01"

    // Numerical placement indicators mapped directly from frontend clicks
    [Required]
    public int RowIndex { get; set; }

    [Required]
    public int ColumnIndex { get; set; }

    public bool IsBroken { get; set; } = false; // Flag to block selection on malfunctioning hardware

    // Navigation property mapping
    [ForeignKey(nameof(LabId))]
    public Lab? Lab { get; set; }
}
