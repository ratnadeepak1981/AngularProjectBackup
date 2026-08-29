using System.Threading.Tasks;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IBackgroundBookingTask
    {
        // Rule: Automatically called by the web host scheduler wrapper to release held lab and event seating
        Task ExecuteHoldCleanupAsync();
    }
}
