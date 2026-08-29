namespace CampusServicesPortal.DTOs.Requests.Events
{
    public class RegisterEventDto
    {
        public int EventId { get; set; }

        // This is null for Open Space venues, but strictly required if UsesReservedSeating is true
        public int? SeatId { get; set; }
    }
}
