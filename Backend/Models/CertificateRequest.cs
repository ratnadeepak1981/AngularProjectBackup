using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class CertificateRequest
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int CertificateTypeId { get; set; }

    [Required]
    [MaxLength(500)]
    public required string Reason { get; set; }

    // Status progression: Pending -> Approved / Rejected -> Ready for Collection (BRD Module 6)
    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";

    [Required]
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties for Entity Framework Core relationship mapping
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [ForeignKey(nameof(CertificateTypeId))]
    public CertificateType? CertificateType { get; set; }
}
