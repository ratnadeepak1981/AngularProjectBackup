using System;

namespace CampusServicesPortal.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string IndexNumber { get; set; } = null!;
        public string FullName { get; set; } = null!; // Matches database column exactly
        public int FacultyId { get; set; }
        public string? ContactDetails { get; set; }
        public bool EmailVerified { get; set; } // Matches database column exactly

        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpiresAt { get; set; }
        public DateTime? DeactivatedAt { get; set; }

        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public virtual Faculty Faculty { get; set; } = null!;

        // 1-to-Many Relationship to Phone Numbers Table
        public virtual ICollection<StudentPhoneNumber> PhoneNumbers { get; set; } = new List<StudentPhoneNumber>();

        // 1-to-Many Relationship to Addresses Table
        public virtual ICollection<StudentAddress> Addresses { get; set; } = new List<StudentAddress>();
    }
}
