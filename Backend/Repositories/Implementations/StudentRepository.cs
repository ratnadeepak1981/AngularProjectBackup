using CampusServicesPortal.Data;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CampusServicesPortal.Repositories.Implementations
{
    public class StudentRepository : IStudentRepository
    {
        private readonly AppDbContext _context;

        public StudentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<StudentMasterList?> GetMasterRecordAsync(string indexNumber)
        {
            return await _context.StudentMasterLists
                .FirstOrDefaultAsync(m => m.IndexNumber == indexNumber);
        }

        public async Task<bool> IsIndexRegisteredAsync(string indexNumber)
        {
            return await _context.Students
                .AnyAsync(s => s.IndexNumber == indexNumber);
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task AddStudentAsync(Student student)
        {
            await _context.Students.AddAsync(student);
        }
        // PUT /api/students/{id} Tracking registration context state changes
        public Task UpdateAsync(Student student)
        {
            _context.Students.Update(student);
            return Task.CompletedTask;
        }

        // GET /api/students Search/Filtering Logic [BRD Module 1]
        public async Task<IEnumerable<Student>> SearchAsync(string? search, string? faculty)
        {
            var query = _context.Students
                .Include(s => s.User)
                .Include(s => s.Faculty)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s => s.FullName.Contains(search) || s.IndexNumber.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(faculty))
            {
                query = query.Where(s => s.Faculty.Name == faculty || s.FacultyId.ToString() == faculty);
            }

            return await query.ToListAsync();
        }


        // GET /api/students/{id} Lookup [Index 0.1.3]
        public async Task<Student?> GetByIdAsync(int id)
        {
            return await _context.Students
                .Include(s => s.User)
                .Include(s => s.Faculty)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        // GET /api/students Search/Filtering Logic [Index 0.1.3]
        public async Task<IEnumerable<Student>> SearchStudentsAsync(string? search, string? faculty)
        {
            var query = _context.Students
                .Include(s => s.User)
                .Include(s => s.Faculty)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s => s.FullName.Contains(search) || s.IndexNumber.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(faculty))
            {
                query = query.Where(s => s.Faculty.Name == faculty || s.FacultyId.ToString() == faculty);
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<StudentMasterList>> SearchMasterListAsync(string? search)
        {
            var query = _context.StudentMasterLists.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(m => m.FullName.Contains(search) || m.IndexNumber.Contains(search));
            }
            return await query.ToListAsync();
        }

        public async Task<HashSet<string>> GetRegisteredIndexNumbersAsync()
        {
            var registeredIndices = await _context.Students
                .Select(s => s.IndexNumber.ToLower())
                .ToListAsync();
            return new HashSet<string>(registeredIndices);
        }

        public async Task BulkImportMasterListAsync(IEnumerable<StudentMasterList> masterRecords)
        {
            foreach (var record in masterRecords)
            {
                // Only insert if the index number doesn't exist in the database
                bool exists = await _context.StudentMasterLists
                    .AnyAsync(m => m.IndexNumber == record.IndexNumber);

                if (!exists)
                {
                    await _context.StudentMasterLists.AddAsync(record);
                }
            }
        }


        // Rule 11: Block if student has an active hostel allocation ('Approved' or 'Room Assigned') [Index 0.1.5, 0.1.19]
        public async Task<bool> HasActiveHostelAllocationAsync(int studentId)
        {
            return await _context.HostelApplications
                .AnyAsync(h => h.StudentId == studentId && (h.Status == "Approved" || h.Status == "Room Assigned"));
        }

        // Rule 11: Block if student has future-dated lab bookings ('Held' or 'Confirmed') [Index 0.1.5, 0.1.19]
        public async Task<bool> HasUpcomingLabBookingsAsync(int studentId)
        {
            return await _context.LabBookings
                .AnyAsync(l => l.StudentId == studentId && l.BookingDate >= DateTime.UtcNow && (l.Status == "Held" || l.Status == "Confirmed"));
        }

        // Rule 11: Block if student has upcoming future-dated event registrations [Index 0.1.5, 0.1.19]
        public async Task<bool> HasUpcomingEventRegistrationsAsync(int studentId)
        {
            return await _context.EventRegistrations
                .Include(er => er.Event)
                .AnyAsync(er => er.StudentId == studentId && er.Event.StartDateTime >= DateTime.UtcNow);
        }


        // Rule 11: Block if student has a pending certificate request [Index 0.1.5, 0.1.19]
        public async Task<bool> HasPendingCertificateRequestAsync(int studentId)
        {
            return await _context.CertificateRequests
                .AnyAsync(c => c.StudentId == studentId && c.Status == "Pending");
        }

        // Rule 11: Block if student has unpaid fees or outstanding library/lab fines [Index 0.1.5, 0.1.19]
        public async Task<bool> HasUnpaidFeesAsync(int studentId)
        {
            return await _context.FeePayments
                .AnyAsync(f => f.StudentId == studentId && f.Status == "Outstanding");
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
