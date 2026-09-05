using System;
using System.Collections.Generic;

namespace CampusServicesPortal.DTOs.Responses.AuditLogs
{
    public class PagedAuditLogResultDto
    {
        public List<AuditLogResponseDto> Items { get; set; } = new List<AuditLogResponseDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    }
}
