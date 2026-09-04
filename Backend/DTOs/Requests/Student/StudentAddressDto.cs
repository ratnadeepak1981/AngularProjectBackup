namespace CampusServicesPortal.DTOs.Requests.Student
{
    public class StudentAddressDto
    {
        public int? Id { get; set; }
        public string AddressType { get; set; } = "Permanent";
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string? DistrictOrProvince { get; set; }
        public string? PostalCode { get; set; }
        public string Country { get; set; } = "Sri Lanka";
        public bool IsPrimary { get; set; } = true;
    }
}
