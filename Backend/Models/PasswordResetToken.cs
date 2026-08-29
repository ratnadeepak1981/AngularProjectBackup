using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class PasswordResetToken
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Token { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; } = false;

    // Navigation property for Entity Framework Core relationship mapping
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }
}
