namespace CampusServicesPortal.DTOs.Requests.Labs
{
    public class CreateLabBookingDto
    {
        public int LabId { get; set; }

        // ADD THIS PROPERTY:
        public int StudentId { get; set; }

        // This is null for Science Labs, but strictly required for Computer Labs (Rules 8 & 14)
        public int? SeatId { get; set; }

        public DateTime BookingDate { get; set; }

        public string TimeSlot { get; set; } = null!; // e.g., "08:00 AM - 10:00 AM"
    }
}
