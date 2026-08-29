using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.Models;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IMasterDataRepository
    {
        Task<SystemSetting?> GetSettingByKeyAsync(string key);
        Task<IEnumerable<Notification>> GetUnreadNotificationsByStudentIdAsync(int studentId);
        Task AddNotificationAsync(Notification notification);
        Task UpdateSettingAsync(SystemSetting setting);
        Task SaveChangesAsync();
    }
}
