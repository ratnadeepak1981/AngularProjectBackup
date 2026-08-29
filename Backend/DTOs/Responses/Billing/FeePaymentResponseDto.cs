using System;

namespace CampusServicesPortal.DTOs.Responses.Billing
{
    public class FeePaymentResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string FeeTypeName { get; set; } = null!;
        public decimal Amount { get; set; }
        public string BillingPeriod { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = null!; // "Outstanding" or "Paid"
        public DateTime? PaidAt { get; set; }
    }
}
