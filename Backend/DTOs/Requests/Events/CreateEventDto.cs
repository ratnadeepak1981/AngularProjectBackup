using System;

namespace CampusServicesPortal.DTOs.Requests.Events
{
    public class CreateEventDto
    {
        public int VenueId { get; set; }
        public string Title { get; set; } = null!;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int Capacity { get; set; }
        public string? Description { get; set; }

        // Match Rule 9: Toggle for unnumbered open space vs reserved numbered seating
        public bool UsesReservedSeating { get; set; }
    }
}
