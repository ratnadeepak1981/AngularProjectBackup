namespace CampusServicesPortal.DTOs.Requests.Billing
{
    public class AssignFeeDto
    {
        public int FeeTypeId { get; set; }
        public decimal Amount { get; set; }
        public string BillingPeriod { get; set; } = null!; // e.g., "2026/Semester 1"
        public string? Description { get; set; }

        // Populate only one to determine scope (Single Student vs. Faculty Bulk)
        public int? StudentId { get; set; }
        public int? FacultyId { get; set; }
    }
}
