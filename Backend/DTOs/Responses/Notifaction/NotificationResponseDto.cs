using System;

namespace CampusServicesPortal.DTOs.Responses.MasterData
{
    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string Message { get; set; } = null!;
        public string Type { get; set; } = null!; // "HostelApproved", "LabHoldExpired", etc.
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
