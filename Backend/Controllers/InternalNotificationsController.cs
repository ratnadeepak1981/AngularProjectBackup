using CampusServicesPortal.DTOs.Requests.Nortifcation;
using CampusServicesPortal.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CampusServicesPortal.Controllers
{
    [ApiController]
    [Route("api/internal/notifications")] // Explicit specification route pattern [PDF: 0.1.17]
    public class InternalNotificationsController : BaseApiController // 🛠️ Changed to BaseApiController to access ProcessServiceResult
    {
        private readonly INotificationService _notificationService;

        public InternalNotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // POST /api/internal/notifications — System channel tracking hook dispatch [PDF: 0.1.17]
        [HttpPost]
        public async Task<IActionResult> CreateInternalNotification([FromBody] CreateNotificationDto dto)
        {
            // The ProcessServiceResult custom base method handles success/failure extraction internally
            var result = await _notificationService.SendInternalNotificationAsync(dto);
            return ProcessServiceResult(result, "Internal service event notification logged successfully.");
        }
    }
}
