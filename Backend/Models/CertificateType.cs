using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.Models;

public class CertificateType
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; } // e.g., "Bonafide Certificate", "Transcript"

    // BRD Rule: A type cannot be hard-deleted if requests reference it. Toggle false instead.
    public bool IsActive { get; set; } = true;
}
