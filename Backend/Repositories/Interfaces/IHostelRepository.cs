using CampusServicesPortal.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IHostelRepository
    {
        Task<HostelApplication?> GetApplicationByIdAsync(int id);
        Task<HostelApplication?> GetActiveApplicationByStudentIdAsync(int studentId);
        Task<IEnumerable<HostelApplication>> GetAllApplicationsAsync();

        // 🛠️ ADD THIS LINE: Fetch all master records for lookups
        Task<IEnumerable<Hostel>> GetAllHostelsAsync();

        Task<Room?> GetRoomByIdAsync(int roomId);
        Task<int> GetRoomCurrentOccupancyAsync(int roomId);
        Task AddApplicationAsync(HostelApplication application);
        Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginTransactionAsync();
        Task SaveChangesAsync();
    }
}
