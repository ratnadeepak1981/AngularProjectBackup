using System;

namespace CampusServicesPortal.DTOs.Requests.AuditLogs
{
    public class AuditLogFilterDto
    {
        public string? SearchTerm { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? UserId { get; set; }
        public string? Module { get; set; }
        public string? Action { get; set; }
        public bool? IsSuccess { get; set; }
        public bool? IsReviewed { get; set; }
        public string? SortBy { get; set; } = "Timestamp";
        public string? SortDirection { get; set; } = "desc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
