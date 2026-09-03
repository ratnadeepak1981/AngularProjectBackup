using System;

namespace CampusServicesPortal.Models;

public class PasswordHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
