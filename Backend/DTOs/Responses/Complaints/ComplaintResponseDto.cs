using System;

namespace CampusServicesPortal.DTOs.Responses.Complaints
{
    public class ComplaintResponseDto
    {
        public int Id { get; set; }

        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Status { get; set; } = null!; // "Pending", "In Progress", "Resolved"
        public string? ResolutionNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
