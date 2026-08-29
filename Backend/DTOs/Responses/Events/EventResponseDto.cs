using System;

namespace CampusServicesPortal.DTOs.Responses.Events
{
    public class EventResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string VenueName { get; set; } = null!;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int Capacity { get; set; }
        public int RegisteredCount { get; set; }
        public string? Description { get; set; }
        public bool UsesReservedSeating { get; set; }
        public bool IsRegistered { get; set; }
    }
}
