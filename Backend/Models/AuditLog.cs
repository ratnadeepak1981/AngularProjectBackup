using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models
{
    [Table("AuditLogs")]
    public class AuditLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public int? UserId { get; set; }

        [MaxLength(150)]
        public string? UserDisplayName { get; set; }

        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Module { get; set; } = null!;

        [MaxLength(100)]
        public string? EntityId { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool IsSuccess { get; set; } = true;

        public bool IsReviewed { get; set; } = true;

        [MaxLength(150)]
        public string? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [MaxLength(100)]
        public string? TraceId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = null!;

        public string? BeforeValuesJson { get; set; }

        public string? AfterValuesJson { get; set; }
    }
}
