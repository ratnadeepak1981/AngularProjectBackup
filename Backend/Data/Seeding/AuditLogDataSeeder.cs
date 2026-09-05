using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.Data;
using CampusServicesPortal.Models;
using Microsoft.EntityFrameworkCore;

namespace CampusServicesPortal.Data.Seeding
{
    public static class AuditLogDataSeeder
    {
        public static async Task SeedAuditLogsAsync(AppDbContext context)
        {
            if (await context.AuditLogs.AnyAsync())
            {
                return;
            }

            var baselineLogs = new List<AuditLog>
            {
                new AuditLog
                {
                    UserId = 1,
                    UserDisplayName = "admin@campus.edu",
                    Action = "Login",
                    Module = "Auth",
                    EntityId = "1",
                    Timestamp = DateTime.UtcNow.AddHours(-24),
                    IsSuccess = true,
                    IpAddress = "192.168.1.10",
                    TraceId = Guid.NewGuid().ToString("N"),
                    Description = "Administrator logged in successfully from campus intranet",
                    BeforeValuesJson = null,
                    AfterValuesJson = null
                },
                new AuditLog
                {
                    UserId = 1,
                    UserDisplayName = "admin@campus.edu",
                    Action = "UpdateSetting",
                    Module = "SystemSettings",
                    EntityId = "SmsOtpExpiryMinutes",
                    Timestamp = DateTime.UtcNow.AddHours(-20),
                    IsSuccess = true,
                    IpAddress = "192.168.1.10",
                    TraceId = Guid.NewGuid().ToString("N"),
                    Description = "Updated SMS OTP Expiration parameter from 2 minutes to 3 minutes",
                    BeforeValuesJson = "{\"SettingKey\":\"SmsOtpExpiryMinutes\",\"SettingValue\":\"2\"}",
                    AfterValuesJson = "{\"SettingKey\":\"SmsOtpExpiryMinutes\",\"SettingValue\":\"3\"}"
                },
                new AuditLog
                {
                    UserId = 2,
                    UserDisplayName = "student1@campus.edu",
                    Action = "LoginFailure",
                    Module = "Auth",
                    EntityId = "2",
                    Timestamp = DateTime.UtcNow.AddHours(-18),
                    IsSuccess = false,
                    IpAddress = "203.94.130.5",
                    TraceId = Guid.NewGuid().ToString("N"),
                    Description = "Failed login attempt: Invalid password hash verification",
                    BeforeValuesJson = null,
                    AfterValuesJson = null
                },
                new AuditLog
                {
                    UserId = 1,
                    UserDisplayName = "admin@campus.edu",
                    Action = "CertificateApproval",
                    Module = "Certificates",
                    EntityId = "101",
                    Timestamp = DateTime.UtcNow.AddHours(-12),
                    IsSuccess = true,
                    IpAddress = "192.168.1.10",
                    TraceId = Guid.NewGuid().ToString("N"),
                    Description = "Approved Official Academic Transcript request for Student ID #1",
                    BeforeValuesJson = "{\"Id\":101,\"Status\":\"PendingApproval\"}",
                    AfterValuesJson = "{\"Id\":101,\"Status\":\"Approved\"}"
                },
                new AuditLog
                {
                    UserId = 1,
                    UserDisplayName = "admin@campus.edu",
                    Action = "TriageComplaint",
                    Module = "Complaints",
                    EntityId = "55",
                    Timestamp = DateTime.UtcNow.AddHours(-8),
                    IsSuccess = true,
                    IpAddress = "192.168.1.10",
                    TraceId = Guid.NewGuid().ToString("N"),
                    Description = "Assigned Hostel Maintenance technician to Room 204 complaint",
                    BeforeValuesJson = "{\"Id\":55,\"Status\":\"Pending\",\"AssignedTo\":null}",
                    AfterValuesJson = "{\"Id\":55,\"Status\":\"In Progress\",\"AssignedTo\":\"Maintenance Team A\"}"
                },
                new AuditLog
                {
                    UserId = 1,
                    UserDisplayName = "admin@campus.edu",
                    Action = "FeeAssignment",
                    Module = "Billing",
                    EntityId = "202",
                    Timestamp = DateTime.UtcNow.AddHours(-4),
                    IsSuccess = true,
                    IpAddress = "192.168.1.10",
                    TraceId = Guid.NewGuid().ToString("N"),
                    Description = "Generated semester tuition invoice of $1500.00 for Student ID #1",
                    BeforeValuesJson = null,
                    AfterValuesJson = "{\"StudentId\":1,\"FeeTypeId\":1,\"Amount\":1500.00,\"Status\":\"Pending\"}"
                }
            };

            await context.AuditLogs.AddRangeAsync(baselineLogs);
            await context.SaveChangesAsync();
        }
    }
}
