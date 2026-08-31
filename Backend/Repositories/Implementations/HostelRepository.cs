using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CampusServicesPortal.Data;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;

namespace CampusServicesPortal.Repositories.Implementations
{
    public class HostelRepository : IHostelRepository
    {
        private readonly AppDbContext _context;

        public HostelRepository(AppDbContext context)
        {
            _context = context;
        }

        // 🛠️ NEW METHOD IMPLEMENTATION: Fetch all master records from the database
        public async Task<IEnumerable<Hostel>> GetAllHostelsAsync()
        {
            return await _context.Hostels
                .Include(h => h.Rooms)
                .Where(h => h.IsActive) // Only select active buildings as verified in SSMS
                .OrderBy(h => h.Name)
                .ToListAsync();
        }


        public async Task<HostelApplication?> GetApplicationByIdAsync(int id)
        {
            return await _context.HostelApplications
                .Include(a => a.Student)
                .Include(a => a.PreferredHostel)
                .Include(a => a.AssignedRoom)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<HostelApplication?> GetActiveApplicationByStudentIdAsync(int studentId)
        {
            // Filters out dropped or rejected historical rows to isolate the active application track
            return await _context.HostelApplications
                .Include(a => a.PreferredHostel)
                .Include(a => a.AssignedRoom)
                .FirstOrDefaultAsync(a => a.StudentId == studentId && a.Status != "Rejected");
        }

        public async Task<IEnumerable<HostelApplication>> GetAllApplicationsAsync()
        {
            return await _context.HostelApplications
                .Include(a => a.Student)
                .Include(a => a.PreferredHostel)
                .Include(a => a.AssignedRoom)
                .OrderByDescending(a => a.Id)
                .ToListAsync();
        }

        public async Task<Room?> GetRoomByIdAsync(int roomId)
        {
            return await _context.Rooms
                .Include(r => r.Hostel)
                .FirstOrDefaultAsync(r => r.Id == roomId);
        }

        public async Task<int> GetRoomCurrentOccupancyAsync(int roomId)
        {
            // Capacity constraint check: Tally active allocation counts matching this room anchor row [PDF: 0.1.7]
            return await _context.HostelApplications
                .CountAsync(a => a.AssignedRoomId == roomId && (a.Status == "RoomAssigned" || a.Status == "Room Assigned"));
        }

        public async Task AddApplicationAsync(HostelApplication application)
        {
            await _context.HostelApplications.AddAsync(application);
        }

        public async Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
