using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class FeePayment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int FeeTypeId { get; set; }

    // Enforces precision parameters required for financial accuracy
    [Required]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public required string BillingPeriod { get; set; } // e.g., "2026/2027 - Sem 1"

    [MaxLength(250)]
    public string? Description { get; set; } // Detailed tracking (e.g., "Fine for damaged equipment")

    // Valid states: "Outstanding" or "Paid"
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Outstanding";

    public DateTime? PaidAt { get; set; }

    // Navigation properties for Entity Framework Core relationship mapping
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [ForeignKey(nameof(FeeTypeId))]
    public FeeType? FeeType { get; set; }
}
