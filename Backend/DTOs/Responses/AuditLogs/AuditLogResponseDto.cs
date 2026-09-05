using System;

namespace CampusServicesPortal.DTOs.Responses.AuditLogs
{
    public class AuditLogResponseDto
    {
        public long Id { get; set; }
        public int? UserId { get; set; }
        public string? UserDisplayName { get; set; }
        public string Action { get; set; } = null!;
        public string Module { get; set; } = null!;
        public string? EntityId { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsSuccess { get; set; }
        public bool IsReviewed { get; set; }
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? IpAddress { get; set; }
        public string? TraceId { get; set; }
        public string Description { get; set; } = null!;
        public string? BeforeValuesJson { get; set; }
        public string? AfterValuesJson { get; set; }
    }
}
