using System;

namespace CampusServicesPortal.DTOs.Responses.Certificates
{
    public class CertificateResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;

        public int CertificateTypeId { get; set; }
        public string CertificateTypeName { get; set; } = null!;
        public string Reason { get; set; } = null!;
        public string Status { get; set; } = null!; // "Pending", "Approved", "Rejected", "Ready for Collection"
        public DateTime RequestedAt { get; set; }
    }
}
