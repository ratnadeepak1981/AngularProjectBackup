using System;

namespace CampusServicesPortal.DTOs.Responses.Hostel.Application
{
    public class HostelApplicationResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public string HostelName { get; set; } = null!;
        public string? RoomNumber { get; set; }
        public string TermSemester { get; set; } = null!;
        public string? SpecialRequirements { get; set; }
        public string Status { get; set; } = null!; // "Pending", "Approved", "Rejected", "Room Assigned"
        public DateTime CreatedAt { get; set; }
    }
}
